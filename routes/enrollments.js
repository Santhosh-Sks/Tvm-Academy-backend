const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');

// All enrollment routes require authentication
router.use(auth);

// Enroll in a course
router.post('/enroll', enrollmentController.enrollCourse);

// Enroll via payment token (from approved enquiry) - public route
router.post('/payment-enroll', enrollmentController.enrollViaPaymentToken);

// Get user's enrollments
router.get('/my-courses', enrollmentController.getUserEnrollments);

// Update course progress
router.put('/:enrollmentId/progress', enrollmentController.updateProgress);

// Get specific enrollment details
router.get('/course/:courseId', enrollmentController.getEnrollmentDetails);

// Check if user is enrolled in a course
router.get('/status/:courseId', enrollmentController.checkEnrollmentStatus);

module.exports = router;
