const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  enrollmentDate: { type: Date, default: Date.now },
  paymentAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], default: 'card' },
  transactionId: { type: String },
  status: { type: String, enum: ['enrolled', 'completed', 'dropped', 'expired'], default: 'enrolled' },
  progress: { type: Number, default: 0 }, // percentage
  progressUpdatedAt: { type: Date },
  progressUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  weeklyProgress: [{
    week: { type: String },
    progress: { type: Number },
    note: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }],
  startDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  certificateIssued: { type: Boolean, default: false },
  notes: { type: String }
}, { timestamps: true });

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
