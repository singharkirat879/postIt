const { validationResult } = require('express-validator')
const Post = require('../models/post')
const fs = require('fs')
const path = require('path')
const User = require('../models/user')

let ITEMS_PER_PAGE = 2;

exports.getPosts = (req, res, next) => {
    let currentPage = +req.query.page || 1;
    let totalItems;
    Post.count()
        .then(numPosts => {
            totalItems = numPosts;
            return Post.findAll({
                limit: ITEMS_PER_PAGE,
                offset: (currentPage - 1) * ITEMS_PER_PAGE
            })
        })
        .then(result => {
            if (!result) {
                const error = new Error('Post not found')
                error.statusCode = 404
                throw error;
            }
            res.status(200).json({
                message: 'Post retrieved Successfully',
                posts: result,
                totalItems: totalItems,
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors, "VALIDATION ERROR IN CREATING POST MAYBE DUE TO TITLE AND CONTENT VALIDATION")
        const error = new Error('Validation Failed!')
        error.statusCode = 422
        throw error;
    }

    if (!req.file) {
        const error = new Error('No image provided or Image format is not as expected. It should be (jpg, png. jpeg)')
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title
    const content = req.body.content
    const imageUrl = 'images/' + req.file.filename


    User.findByPk(req.userId)
        .then(user => {
            return user.createPost({
                title: title,
                content: content,
                imageUrl: imageUrl,
                creator: { name: user.name }
            })
        })
        .then(result => {
            res.status(201).json({
                message: 'Post created Successfully',
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findByPk(postId)
        .then(result => {
            if (!result) {
                const error = new Error('Post not found')
                error.statusCode = 404
                throw error;
            }
            res.status(200).json({
                message: 'Post retrieved Successfully',
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.updatePost = (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        const err = new Error('Request for update failed')
        err.statusCode = 422
        throw err;
    }

    const postId = req.params.postId;
    const title = req.body.title
    const content = req.body.content
    let imageUrl = req.body.image

    if (req.file) {
        imageUrl = 'images/' + req.file.filename
    }

    if (!imageUrl) {
        const error = new Error('Choose a file')
        error.statusCode = 422
        throw error;
    }

    Post.findByPk(postId)
        .then(post => {
            // console.log(post.userId, "Updating Post")

            if (!post) {
                const error = new Error('Post not found')
                error.statusCode = 404;
                throw error;
            }

            if (String(req.userId) !== String(post.userId)) {
                const error = new Error('Not authorized');
                error.statusCode = 403;
                throw error;
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }

            post.title = title
            post.imageUrl = imageUrl
            post.content = content

            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'Post updated!',
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const clearImage = filePath => {

    if (!filePath) {
        return;
    }

    filePath = path.join(__dirname, '..', filePath);

    fs.unlink(filePath, err => {
        if (err) {
            console.log(err);
        }
    });
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId

    Post.findByPk(postId)
        .then(post => {
            console.log(post, "Delting this post")
            if (!post) {
                const error = new Error('Post not found :(')
                error.statusCode = 404
                throw error;
            }

            if (String(req.userId) !== String(post.userId)) {
                const error = new Error('Not authorized');
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl)

            return post.destroy()
        })
        .then(result => {
            res.status(200).json({
                message: 'Post deleted succesfully!'
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}