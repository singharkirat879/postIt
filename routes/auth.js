const express = require('express')
const router = express.Router();
const authController = require('../controllers/auth')
const { body } = require('express-validator');
const isAuth = require('../middlewares/is-auth');

router.post('/signup',
    [
        body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
        body('name').isLength({ min: 6 }),
        body('password', 'Please enter a password with only numbers and text and at least 6 characters')
            .isLength({ min: 6 })
            .isAlphanumeric().trim()
    ],
    authController.postSignup)

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 6 characters')
        .isLength({ min: 6 })
        .isAlphanumeric().trim()
], authController.postLogin)

router.get('/status', isAuth, authController.getStatus);

router.patch('/status', isAuth, [
    body('status').trim().not().isEmpty()
], authController.updateStatus);

module.exports = router;