const Enquiry = require('../models/Enquiry');
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const crypto = require('crypto');

exports.create = async (req, res) => {
  const { name, email, phone, course, message } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
  
  try {
    let courseId = null;
    if (course) {
      const foundCourse = await Course.findOne({ 
        title: { $regex: new RegExp(course, 'i') } 
      });
      if (foundCourse) {
        courseId = foundCourse._id;
      }
    }

    const enq = new Enquiry({ 
      name, 
      email, 
      phone, 
      course, 
      courseId, 
      message 
    });
    
    await enq.save();
    console.log('Enquiry saved:', enq);
    res.status(201).json({ message: 'Enquiry submitted successfully' });
  } catch (err) {
    console.error('Error saving enquiry:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('courseId') // Populate the courseId field
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`Found ${enquiries.length} enquiries`);
    res.json(enquiries);
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { status, adminNotes } = req.body;
  if (!['new','contacted','approved','payment_sent','enrolled','closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;

    // If approving, generate payment token
    if (status === 'approved') {
      updateData.paymentToken = crypto.randomBytes(32).toString('hex');
      updateData.paymentTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      updateData.status = 'payment_sent'; // Automatically move to payment_sent
    }

    const enq = await Enquiry.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('courseId');
    if (!enq) return res.status(404).json({ message: 'Enquiry not found' });

    // If status is enrolled, create enrollment record
    if (status === 'enrolled') {
      try {
        // Find the user by email
        console.log(`Looking for user with email: ${enq.email}`);
        const user = await User.findOne({ email: enq.email });
        console.log(`Found user:`, user);
        if (!user) {
          return res.status(404).json({ message: 'User not found. User must have an account to be enrolled.' });
        }

        // Find the course
        let course = null;
        if (enq.courseId) {
          course = await Course.findById(enq.courseId);
        } else if (enq.course) {
          // Try to find course by title if courseId is not available
          course = await Course.findOne({ 
            title: { $regex: new RegExp(enq.course, 'i') } 
          });
        }

        if (!course) {
          return res.status(404).json({ message: 'Course not found for enrollment' });
        }

        // Check if user is already enrolled
        const existingEnrollment = await Enrollment.findOne({ 
          userId: user._id, 
          courseId: course._id 
        });

        if (!existingEnrollment) {
          // Create enrollment record
          console.log(`Creating enrollment for user ID: ${user._id}, course ID: ${course._id}`);
          const enrollment = new Enrollment({
            userId: user._id,
            courseId: course._id,
            paymentAmount: course.fee || 0,
            paymentStatus: 'completed',
            paymentMethod: 'card', // Use valid enum value
            transactionId: `ADMIN_ENROLL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'enrolled',
            notes: adminNotes || 'Enrolled by admin via enquiry approval'
          });

          await enrollment.save();
          console.log(`Successfully created enrollment:`, enrollment);
          console.log(`Created enrollment for user ${user.email} in course ${course.title}`);
        } else {
          console.log(`User ${user.email} is already enrolled in ${course.title}`);
        }

      } catch (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        // Don't fail the status update if enrollment creation fails
        // Just log the error and continue
      }
    }

    res.json({ 
      message: status === 'approved' ? 'Enquiry approved and payment link generated' : 
               status === 'enrolled' ? 'Student enrolled successfully' : 'Status updated',
      enquiry: enq,
      paymentLink: status === 'approved' ? `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/${enq.paymentToken}` : null
    });
  } catch (err) {
    console.error('Error updating enquiry:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get enquiry by payment token (for payment page)
exports.getByPaymentToken = async (req, res) => {
  try {
    const { token } = req.params;
    const enquiry = await Enquiry.findOne({ 
      paymentToken: token,
      paymentTokenExpiry: { $gt: new Date() },
      status: 'payment_sent'
    }).populate('course');

    if (!enquiry) {
      return res.status(404).json({ message: 'Invalid or expired payment link' });
    }

    res.json({
      enquiry: {
        _id: enquiry._id,
        name: enquiry.name,
        email: enquiry.email,
        course: enquiry.course,
        paymentToken: enquiry.paymentToken
      }
    });
  } catch (err) {
    console.error('Error fetching enquiry by token:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
