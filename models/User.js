const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date },
  enrolledCourses: [{ 
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    enrolledDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
    progress: { type: Number, default: 0 }, // percentage
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
