const router = require('express').Router();
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const { signup, login, firebaseAuth } = require('../Controllers/AuthController');
const { forgotPassword, verifyOTP, resetPassword } = require('../Controllers/PasswordResetController');

router.post('/login', loginValidation, login);

router.post('/signup', signupValidation, signup);

router.post('/firebase-auth', firebaseAuth);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;