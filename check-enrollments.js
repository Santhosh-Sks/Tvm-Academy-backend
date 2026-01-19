require('dotenv').config();
const mongoose = require('mongoose');
const Enrollment = require('./models/Enrollment');
const User = require('./models/User');
const Course = require('./models/Course');

async function checkEnrollments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tvm-academy');
    console.log('Connected to MongoDB');

    // Find sivakumar's user record
    const user = await User.findOne({ email: 'sivakumar@gmail.com' });
    console.log('Sivakumar user:', user);

    // Find all enrollments for sivakumar
    const enrollments = await Enrollment.find({ userId: user._id }).populate('courseId');
    console.log('Sivakumar enrollments:', enrollments);

    // Find all enrollments in the database
    const allEnrollments = await Enrollment.find().populate('userId').populate('courseId');
    console.log('All enrollments:', allEnrollments);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEnrollments();
