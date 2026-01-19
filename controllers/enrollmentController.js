const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const Enquiry = require('../models/Enquiry');

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId, paymentMethod = 'card' } = req.body;
    const userId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId,
      paymentAmount: course.fee || course.price || 0,
      paymentMethod,
      paymentStatus: 'completed', // In real app, integrate with payment gateway
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    await enrollment.save();

    // Update user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $push: {
        enrolledCourses: {
          courseId,
          enrolledDate: new Date(),
          status: 'enrolled',
          progress: 0,
          paymentStatus: 'completed'
        }
      }
    });

    // Populate course details
    await enrollment.populate('courseId', 'title description duration fee');

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
};

exports.getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title description duration fee')
      .sort({ enrollmentDate: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({ _id: enrollmentId, userId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    enrollment.progress = Math.max(0, Math.min(100, progress));
    
    // Mark as completed if progress reaches 100%
    if (enrollment.progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
    }

    await enrollment.save();

    // Update user's enrolled courses progress
    await User.findOneAndUpdate(
      { _id: userId, 'enrolledCourses.courseId': enrollment.courseId },
      { 
        $set: { 
          'enrolledCourses.$.progress': enrollment.progress,
          'enrolledCourses.$.status': enrollment.status
        }
      }
    );

    res.json({ message: 'Progress updated successfully', enrollment });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEnrollmentDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({ userId, courseId })
      .populate('courseId', 'title description duration fee');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('Error fetching enrollment details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    
    res.json({ 
      isEnrolled: !!enrollment,
      enrollment: enrollment ? {
        status: enrollment.status,
        progress: enrollment.progress,
        enrollmentDate: enrollment.enrollmentDate
      } : null
    });
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Enroll course via payment token (from approved enquiry)
exports.enrollViaPaymentToken = async (req, res) => {
  try {
    const { paymentToken, paymentMethod = 'card', userEmail, userName } = req.body;

    // Find the enquiry with valid payment token
    const enquiry = await Enquiry.findOne({ 
      paymentToken,
      paymentTokenExpiry: { $gt: new Date() },
      status: 'payment_sent'
    }).populate('course');

    if (!enquiry) {
      return res.status(404).json({ message: 'Invalid or expired payment link' });
    }

    // Find or create user account
    let user = await User.findOne({ email: enquiry.email });
    if (!user) {
      // Create new user account with temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      user = new User({
        name: userName || enquiry.name,
        email: enquiry.email,
        password: tempPassword, // User will need to reset password
        role: 'user'
      });
      await user.save();
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({ 
      userId: user._id, 
      courseId: enquiry.course._id 
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId: user._id,
      courseId: enquiry.course._id,
      paymentAmount: enquiry.course.fee || 0,
      paymentMethod,
      paymentStatus: 'completed',
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    await enrollment.save();

    // Update user's enrolled courses
    await User.findByIdAndUpdate(user._id, {
      $push: {
        enrolledCourses: {
          courseId: enquiry.course._id,
          enrolledDate: new Date(),
          status: 'enrolled',
          progress: 0,
          paymentStatus: 'completed'
        }
      }
    });

    // Update enquiry status to enrolled
    await Enquiry.findByIdAndUpdate(enquiry._id, {
      status: 'enrolled'
    });

    // Populate course details
    await enrollment.populate('courseId', 'title description duration fee');

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment,
      userAccount: {
        email: user.email,
        isNewAccount: !await User.findOne({ email: enquiry.email, createdAt: { $lt: user.createdAt } })
      }
    });
  } catch (error) {
    console.error('Payment enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
};
