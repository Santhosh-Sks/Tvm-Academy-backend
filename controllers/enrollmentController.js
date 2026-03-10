const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const Enquiry = require('../models/Enquiry');

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId, paymentMethod = 'card' } = req.    console.log('✅ Found enrollment:', enrollment._id);
    console.log('📊 Current progress:', enrollment.progress);
    console.log('📊 New progress value:', progressNumber);
    console.log('📅 Enrollment start date:', enrollment.startDate);

    // Validate that progress can only increase (prevent regression)
    const currentProgress = enrollment.progress || 0;
    if (progressNumber < currentProgress) {
      console.log('❌ Progress decrease not allowed. Current:', currentProgress, 'Requested:', progressNumber);
      return res.status(400).json({ 
        message: `Progress can only be increased. Current progress is ${currentProgress}%, cannot set to ${progressNumber}%`,
        currentProgress,
        requestedProgress: progressNumber,
        suggestion: 'Please enter a value higher than the current progress.',
        validationError: 'PROGRESS_DECREASE_NOT_ALLOWED'
      });
    }

    if (progressNumber === currentProgress) {
      console.log('⚠️ Progress value unchanged:', progressNumber);
      return res.status(400).json({ 
        message: `Progress is already at ${progressNumber}%. Please enter a higher value to update progress.`,
        currentProgress,
        suggestion: 'Enter a percentage higher than the current progress to update.',
        validationError: 'PROGRESS_UNCHANGED'
      });
    }

    console.log('✅ Progress increase validated:', currentProgress, '→', progressNumber);

    // Calculate current week with better error handling

    // Calculate current week with better error handling;
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

// Admin-only methods
exports.getAllEnrollments = async (req, res) => {
  try {
    console.log('getAllEnrollments called by user:', req.user);
    console.log(' User role:', req.user?.role);
    
    // Temporarily bypass admin check for debugging
    console.log('⚠️ DEBUGGING MODE - Bypassing admin check');
    
    console.log('Fetching enrollments...');
    const enrollments = await Enrollment.find()
      .populate('userId', 'name email phone')
      .populate('courseId', 'title description duration fee')
      .sort({ createdAt: -1 });

    console.log(`Found ${enrollments.length} enrollments`);
    res.json(enrollments);
  } catch (error) {
    console.error('❌ Error fetching all enrollments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStudentProgress = async (req, res) => {
  try {
    console.log('🔍 updateStudentProgress called by user:', req.user);
    console.log('📋 Request body:', req.body);
    console.log('📋 Request params:', req.params);

    // Temporarily bypass admin check for debugging
    console.log('⚠️ DEBUGGING MODE - Bypassing admin check for updateStudentProgress');
    
    const { enrollmentId } = req.params;
    const { progress, weekNote } = req.body;

    // Validate progress input
    if (progress === undefined || progress === null) {
      console.log('❌ Progress value is missing');
      return res.status(400).json({ message: 'Progress value is required' });
    }

    const progressNumber = parseInt(progress);
    if (isNaN(progressNumber) || progressNumber < 0 || progressNumber > 100) {
      console.log('❌ Invalid progress value:', progress);
      return res.status(400).json({ message: 'Progress must be a number between 0 and 100' });
    }

    console.log('🔍 Looking for enrollment with ID:', enrollmentId);
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      console.log('❌ Enrollment not found for ID:', enrollmentId);
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    console.log('✅ Found enrollment:', enrollment._id);
    console.log('📊 Current progress:', enrollment.progress);
    console.log('� New progress value:', progressNumber);
    console.log('�📅 Enrollment start date:', enrollment.startDate);

    // Calculate current week with better error handling
    let weekNumber = 1;
    let currentWeek = 'Week 1';
    
    try {
      if (enrollment.startDate) {
        const daysSinceStart = Math.floor((new Date() - new Date(enrollment.startDate)) / (24 * 60 * 60 * 1000));
        weekNumber = Math.max(1, Math.ceil(daysSinceStart / 7));
        currentWeek = `Week ${weekNumber}`;
      }
    } catch (dateError) {
      console.log('⚠️ Error calculating week, using default:', dateError);
    }
    
    console.log('📅 Calculated current week:', currentWeek);

    // Update progress (REPLACE, not add)
    const previousProgress = enrollment.progress;
    enrollment.progress = progressNumber; // Direct assignment, no Math operations needed since we validated above
    enrollment.progressUpdatedAt = new Date();
    enrollment.progressUpdatedBy = req.user.id;

    console.log('📊 Progress updated from', previousProgress, 'to', enrollment.progress);

    // Initialize weeklyProgress array if it doesn't exist
    if (!Array.isArray(enrollment.weeklyProgress)) {
      console.log('🔧 Initializing weeklyProgress array');
      enrollment.weeklyProgress = [];
    }
    
    // Add to weekly progress history
    const weeklyProgressEntry = {
      week: currentWeek,
      progress: enrollment.progress,
      note: weekNote || '',
      updatedBy: req.user.id,
      updatedAt: new Date()
    };
    
    enrollment.weeklyProgress.push(weeklyProgressEntry);
    console.log('📈 Added weekly progress entry:', weeklyProgressEntry);

    // Mark as completed if progress reaches 100%
    if (enrollment.progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
      console.log('🎉 Marked as completed');
    } else if (enrollment.progress < 100 && enrollment.status === 'completed') {
      // If progress was reduced below 100%, change status back to enrolled
      enrollment.status = 'enrolled';
      enrollment.completionDate = null;
      console.log('📝 Changed status back to enrolled');
    }

    console.log('💾 Saving enrollment...');
    const savedEnrollment = await enrollment.save();
    console.log('✅ Enrollment saved successfully');

    // Update user's enrolled courses progress with error handling
    try {
      console.log('👤 Updating user enrolled courses...');
      const userUpdateResult = await User.findOneAndUpdate(
        { _id: enrollment.userId, 'enrolledCourses.courseId': enrollment.courseId },
        { 
          $set: { 
            'enrolledCourses.$.progress': enrollment.progress,
            'enrolledCourses.$.status': enrollment.status
          }
        },
        { new: true }
      );
      
      if (userUpdateResult) {
        console.log('✅ User courses updated successfully');
      } else {
        console.log('⚠️ User course update: no matching document found');
      }
    } catch (userUpdateError) {
      console.log('⚠️ Error updating user courses (non-critical):', userUpdateError);
      // Continue with the response even if user update fails
    }

    // Populate the updated enrollment for response
    try {
      console.log('📋 Populating enrollment data...');
      await savedEnrollment.populate([
        { path: 'userId', select: 'name email' },
        { path: 'courseId', select: 'title' }
      ]);
      console.log('✅ Enrollment populated');
    } catch (populateError) {
      console.log('⚠️ Error populating enrollment (non-critical):', populateError);
    }

    res.json({ 
      message: 'Student progress updated successfully', 
      enrollment: savedEnrollment,
      weekNote: weekNote || '',
      updatedWeek: currentWeek,
      previousProgress,
      newProgress: enrollment.progress
    });
    
  } catch (error) {
    console.error('❌ Error updating student progress:', error);
    console.error('❌ Error stack:', error.stack);
    
    // More specific error messages
    let errorMessage = 'Server error updating student progress';
    if (error.name === 'ValidationError') {
      errorMessage = 'Data validation error: ' + error.message;
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid data format: ' + error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
