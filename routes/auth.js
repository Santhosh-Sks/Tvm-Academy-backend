const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.post('/register', authController.register);
router.post('/verify-registration', authController.verifyRegistrationOTP);
router.post('/resend-verification', authController.resendRegistrationOTP);
router.post('/login', authController.login);

// OTP Authentication routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Password Reset routes
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

// Admin routes for student password reset
router.post('/admin/reset-student-password/:studentId', auth, adminOnly, authController.adminResetStudentPassword);

module.exports = router;
