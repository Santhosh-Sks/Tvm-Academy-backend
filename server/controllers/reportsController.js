const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');

// Generate monthly enrollment report
exports.getMonthlyEnrollmentReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const currentDate = new Date();
    const reportMonth = parseInt(month) || currentDate.getMonth() + 1;
    const reportYear = parseInt(year) || currentDate.getFullYear();
    
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);
    
    console.log('📊 Generating report for:', { month: reportMonth, year: reportYear });
    
    // Get enrollments for the month
    const enrollments = await Enrollment.find({
      enrollmentDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('courseId userId');
    
    // Calculate summary statistics
    const summary = {
      totalEnrollments: enrollments.length,
      totalRevenue: enrollments.reduce((sum, enrollment) => sum + (enrollment.paymentAmount || 0), 0),
      uniqueStudents: [...new Set(enrollments.map(e => e.userId?._id?.toString()))].filter(Boolean).length,
      averageRevenuePerEnrollment: enrollments.length > 0 ? 
        enrollments.reduce((sum, enrollment) => sum + (enrollment.paymentAmount || 0), 0) / enrollments.length : 0
    };
    
    // Course-wise statistics (simplified)
    const courseStatsMap = {};
    enrollments.forEach(enrollment => {
      const courseId = enrollment.courseId?._id?.toString();
      const courseName = enrollment.courseId?.title || 'Unknown Course';
      const revenue = enrollment.paymentAmount || 0;
      
      if (!courseStatsMap[courseId]) {
        courseStatsMap[courseId] = {
          _id: courseId,
          courseName: courseName,
          enrollmentCount: 0,
          totalRevenue: 0
        };
      }
      
      courseStatsMap[courseId].enrollmentCount++;
      courseStatsMap[courseId].totalRevenue += revenue;
    });
    
    const courseStats = Object.values(courseStatsMap).sort((a, b) => b.enrollmentCount - a.enrollmentCount);

    // Daily trend (simplified)
    const dailyStatsMap = {};
    enrollments.forEach(enrollment => {
      const day = new Date(enrollment.enrollmentDate).getDate();
      const revenue = enrollment.paymentAmount || 0;
      
      if (!dailyStatsMap[day]) {
        dailyStatsMap[day] = {
          _id: { day: day },
          enrollments: 0,
          revenue: 0
        };
      }
      
      dailyStatsMap[day].enrollments++;
      dailyStatsMap[day].revenue += revenue;
    });
    
    const dailyTrend = Object.values(dailyStatsMap).sort((a, b) => a._id.day - b._id.day);

    const report = {
      period: {
        month: reportMonth,
        year: reportYear,
        monthName: new Date(reportYear, reportMonth - 1).toLocaleDateString('en-US', { month: 'long' })
      },
      summary,
      courseStats,
      dailyTrend
    };

    res.json({ success: true, report });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ success: false, message: 'Error generating report', error: error.message });
  }
};

// Generate yearly overview report
exports.getYearlyOverviewReport = async (req, res) => {
  try {
    const { year } = req.query;
    const reportYear = parseInt(year) || new Date().getFullYear();
    
    const startDate = new Date(reportYear, 0, 1);
    const endDate = new Date(reportYear, 11, 31, 23, 59, 59);
    
    console.log('📊 Generating yearly overview for:', reportYear);
    
    // Get all enrollments for the year
    const enrollments = await Enrollment.find({
      enrollmentDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('courseId');
    
    // Monthly breakdown
    const monthlyStatsMap = {};
    for (let i = 1; i <= 12; i++) {
      monthlyStatsMap[i] = {
        _id: { month: i, year: reportYear },
        enrollments: 0,
        revenue: 0
      };
    }
    
    enrollments.forEach(enrollment => {
      const month = new Date(enrollment.enrollmentDate).getMonth() + 1;
      const revenue = enrollment.paymentAmount || 0;
      
      monthlyStatsMap[month].enrollments++;
      monthlyStatsMap[month].revenue += revenue;
    });
    
    const monthlyStats = Object.values(monthlyStatsMap);
    
    // Popular courses
    const courseStatsMap = {};
    enrollments.forEach(enrollment => {
      const courseId = enrollment.courseId?._id?.toString();
      const courseName = enrollment.courseId?.title || 'Unknown Course';
      const revenue = enrollment.paymentAmount || 0;
      
      if (!courseStatsMap[courseId]) {
        courseStatsMap[courseId] = {
          courseName: courseName,
          enrollmentCount: 0,
          totalRevenue: 0
        };
      }
      
      courseStatsMap[courseId].enrollmentCount++;
      courseStatsMap[courseId].totalRevenue += revenue;
    });
    
    const popularCourses = Object.values(courseStatsMap)
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10);
    
    const report = {
      year: reportYear,
      monthlyStats,
      popularCourses,
      totals: {
        enrollments: enrollments.length,
        revenue: enrollments.reduce((sum, e) => sum + (e.paymentAmount || 0), 0)
      }
    };
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error generating yearly report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating yearly report',
      error: error.message 
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Dashboard stats request received');
    console.log('👤 User:', req.user);
    console.log('🔐 Auth header:', req.headers.authorization);
    
    // Current month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Last month dates
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    console.log('📅 Date ranges:', { currentMonthStart, currentMonthEnd, lastMonthStart, lastMonthEnd });
    
    // Get counts
    const currentMonthEnrollments = await Enrollment.countDocuments({
      enrollmentDate: { $gte: currentMonthStart, $lte: currentMonthEnd }
    });
    
    const lastMonthEnrollments = await Enrollment.countDocuments({
      enrollmentDate: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    
    // Current month revenue
    const currentMonthEnrollmentData = await Enrollment.find({
      enrollmentDate: { $gte: currentMonthStart, $lte: currentMonthEnd }
    });
    
    const currentMonthRevenue = currentMonthEnrollmentData.reduce((sum, e) => sum + (e.paymentAmount || 0), 0);
    
    // Other statistics
    const totalCourses = await Course.countDocuments({ status: { $ne: 'inactive' } });
    const totalStudents = await User.countDocuments({ role: 'user', isEmailVerified: true });
    const pendingEnquiries = await Enquiry.countDocuments({ status: { $in: ['new', 'contacted'] } });
    
    // Calculate growth
    const growthPercentage = lastMonthEnrollments > 0 ? 
      (((currentMonthEnrollments - lastMonthEnrollments) / lastMonthEnrollments) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      stats: {
        currentMonth: {
          enrollments: currentMonthEnrollments,
          revenue: currentMonthRevenue
        },
        lastMonth: {
          enrollments: lastMonthEnrollments
        },
        growth: {
          enrollments: parseFloat(growthPercentage)
        },
        totals: {
          courses: totalCourses,
          students: totalStudents,
          pendingEnquiries: pendingEnquiries
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting dashboard statistics',
      error: error.message 
    });
  }
};

// Generate course-specific report
exports.getCourseReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;
    
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const enrollments = await Enrollment.find({
      courseId: courseId,
      enrollmentDate: { $gte: start, $lte: end }
    }).populate('userId');
    
    const enquiries = await Enquiry.find({
      courseId: courseId,
      createdAt: { $gte: start, $lte: end }
    });
    
    const totalEnrollments = enrollments.length;
    const totalEnquiries = enquiries.length;
    const conversionRate = totalEnquiries > 0 ? ((totalEnrollments / totalEnquiries) * 100).toFixed(2) : 0;
    const totalRevenue = enrollments.reduce((sum, e) => sum + (e.paymentAmount || 0), 0);
    
    res.json({
      success: true,
      report: {
        course: {
          id: course._id,
          name: course.title,
          fees: course.fees
        },
        period: { start, end },
        statistics: {
          totalEnrollments,
          totalEnquiries,
          conversionRate: parseFloat(conversionRate),
          totalRevenue
        },
        enrollments: enrollments.map(e => ({
          studentName: e.userId?.name,
          enrollmentDate: e.enrollmentDate,
          paymentAmount: e.paymentAmount,
          status: e.status
        }))
      }
    });
    
  } catch (error) {
    console.error('Error getting course report:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting course statistics',
      error: error.message 
    });
  }
};
