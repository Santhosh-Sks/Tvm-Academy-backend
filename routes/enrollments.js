const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');

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

// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Enrollment routes test - User:', req.user?.email || 'not authenticated');
  res.json({ message: 'Enrollment routes working', user: req.user?.email || 'not authenticated' });
});

// Debug route to check enrollments count
router.get('/debug/count', async (req, res) => {
  try {
    const count = await Enrollment.countDocuments();
    const enrollments = await Enrollment.find().limit(3)
      .populate('userId', 'name email')
      .populate('courseId', 'title');
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    
    res.json({ 
      message: 'Debug enrollment data',
      enrollmentCount: count,
      userCount,
      courseCount,
      sampleEnrollments: enrollments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route to create sample enrollment (admin only)
router.post('/debug/create-sample', async (req, res) => {
  try {
    console.log('🧪 Creating sample enrollment data...');
    
    // Find first user and first course
    const user = await User.findOne({ role: 'user' });
    const course = await Course.findOne();
    
    if (!user) {
      return res.status(400).json({ error: 'No user found. Please create a student user first.' });
    }
    
    if (!course) {
      return res.status(400).json({ error: 'No course found. Please create a course first.' });
    }
    
    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ 
      userId: user._id, 
      courseId: course._id 
    });
    
    if (existingEnrollment) {
      return res.json({ 
        message: 'Sample enrollment already exists',
        enrollment: existingEnrollment
      });
    }
    
    // Create sample enrollment
    const enrollment = new Enrollment({
      userId: user._id,
      courseId: course._id,
      paymentAmount: course.fee || 1000,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      transactionId: `SAMPLE_${Date.now()}`,
      status: 'enrolled',
      progress: 25, // 25% progress
      startDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)) // Started 1 week ago
    });
    
    await enrollment.save();
    
    // Populate the enrollment
    await enrollment.populate('userId', 'name email')
      .populate('courseId', 'title');
    
    res.json({
      message: 'Sample enrollment created successfully',
      enrollment
    });
    
  } catch (error) {
    console.error('Error creating sample enrollment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin-only routes (temporarily removing adminOnly middleware for debugging)
console.log('📋 Registering admin enrollment routes...');
router.get('/admin/all', (req, res, next) => {
  console.log('🔍 Admin/all route hit by:', req.user?.email || 'unknown');
  console.log('🔍 Full request path:', req.originalUrl);
  next();
}, enrollmentController.getAllEnrollments);

router.put('/:enrollmentId/admin/progress', (req, res, next) => {
  console.log('📊 Admin progress update route hit by:', req.user?.email || 'unknown');
  next();
}, enrollmentController.updateStudentProgress);

module.exports = router;
