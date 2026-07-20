const express = require('express')
const router = express.Router();
const {body} = require('express-validator')
const isAuth = require('../middlewares/is-auth')

const feedController = require('../controllers/feed')

router.get('/posts',isAuth, feedController.getPosts)

router.post('/post', isAuth,
    [
        body('title').trim().isLength({min: 5}),
        body('content').trim().isLength({min: 5})
    ],
    feedController.createPost)

router.get('/posts/:postId', isAuth, feedController.getPost);

router.put('/posts/:postId', isAuth, [
        body('title').trim().isLength({min: 5}),
        body('content').trim().isLength({min: 5})
    ],
    feedController.updatePost)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router;