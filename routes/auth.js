const express = require('express')
const router = express.Router();
const authController = require('../controllers/auth')
const { body } = require('express-validator');
const isAuth = require('../middlewares/is-auth');

router.post('/signup',
    [
        body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
        body('name').isLength({ min: 6 }),
        body('password', 'Your password must be at least 8 characters and should incldue a combination of uppercase letters, lowercase letters, and numbers.')
            .isLength({ min: 8 }).matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/
            )
    ],
    authController.postSignup)

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
    body('password', 'Your password must be at least 8 characters and should incldue a combination of uppercase letters, lowercase letters, numbers and special characters[@$!%*?&].')
        .isLength({ min: 8 }).matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/
        )
], authController.postLogin)

router.get('/status', isAuth, authController.getStatus);

router.patch('/status', isAuth, [
    body('status').trim().not().isEmpty()
], authController.updateStatus);

module.exports = router;
