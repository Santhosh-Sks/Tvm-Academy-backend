const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enquirySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  course: { type: String }, // Changed to String to store course title
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' }, // Optional ObjectId reference
  message: { type: String },
  status: { type: String, enum: ['new','contacted','approved','payment_sent','enrolled','closed'], default: 'new' },
  paymentToken: { type: String }, // Unique token for payment link
  paymentTokenExpiry: { type: Date }, // Payment link expiry
  adminNotes: { type: String }, // Admin notes for approval
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
