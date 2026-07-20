const { validationResult } = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const name = req.body.name
    const password = req.body.password

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!')
        error.statusCode = 422
        error.data = errors.array();
        throw error;
    }

    User.findOne({
        where: {
            email: email
        }
    })
        .then(user => {
            if (user) {
                const error = new Error('User already exists');
                error.statusCode = 422;
                throw error;
            }

            return bcrypt.hash(password, 12)
        })
        .then(hashedPassword => {
            return User.create({
                email: email,
                password: hashedPassword,
                name: name,
                status: "I am new!"
            })
        })
        .then(user => {
            console.log("User created")
            res.status(201).json({
                message: 'User Created',
                userId: user.id
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        }
        )
}
exports.postLogin = (req, res, next) => {
    const errors = validationResult(req)
    const email = req.body.email
    const password = req.body.password
    let loadedUser;

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!')
        error.statusCode = 422
        error.data = errors.array();
        throw error;
    }

    User.findOne({
        where: {
            email: email
        }
    })
        .then(user => {
            if (!user) {
                const error = new Error('User not Found. Please Signup')
                error.statusCode = 401
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password)
        })
        .then(doMatch => {
            if (!doMatch) {
                const error = new Error("Password didn't match")
                error.statusCode = 401
                throw error
            }

            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser.id.toString()
            },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

            res.status(200).json({
                token: token,
                userId: loadedUser.id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        })
}

exports.getStatus = (req, res, next) => {
    User.findByPk(req.userId)
        .then(user => {
            res.status(200).json({ status: user.status });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.updateStatus = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const newStatus = req.body.status;

    User.findByPk(req.userId)
        .then(user => {
            user.status = newStatus;
            return user.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Status updated successfully.', status: newStatus });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

