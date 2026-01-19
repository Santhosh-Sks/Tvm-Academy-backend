const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/verify-registration', authController.verifyRegistrationOTP);
router.post('/resend-verification', authController.resendRegistrationOTP);
router.post('/login', authController.login);

// OTP Authentication routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
