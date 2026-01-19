const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Test route (no auth required)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Reports API is working',
    timestamp: new Date().toISOString()
  });
});

// All other report routes require admin authentication
router.use(auth);
router.use(adminOnly);

// Monthly enrollment report
router.get('/monthly-enrollment', reportsController.getMonthlyEnrollmentReport);

// Yearly overview report
router.get('/yearly-overview', reportsController.getYearlyOverviewReport);

// Course-specific report
router.get('/course/:courseId', reportsController.getCourseReport);

// Dashboard statistics
router.get('/dashboard-stats', reportsController.getDashboardStats);

module.exports = router;
