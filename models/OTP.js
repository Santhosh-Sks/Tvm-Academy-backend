const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60 // Expires in minutes
  },
  verified: {
    type: Boolean,
    default: false
  },
  purpose: {
    type: String,
    enum: ['login', 'register', 'password-reset'],
    default: 'login'
  }
});

// Index for faster queries
otpSchema.index({ email: 1, verified: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || 5);
  const expiryTime = new Date(this.createdAt.getTime() + expiryMinutes * 60000);
  return Date.now() > expiryTime;
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

module.exports = mongoose.model('OTP', otpSchema);
