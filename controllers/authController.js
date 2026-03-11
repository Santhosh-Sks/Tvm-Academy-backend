const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilioService = require('../services/twilioService');

exports.register = async (req, res) => {
  console.log('🚀 Register endpoint called with body:', req.body);
  console.log('🔧 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_CONNECTED: require('mongoose').connection.readyState === 1,
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
  });
  
  const { name, email, phone, password } = req.body;
  
  if (!name || !email || !phone || !password) {
    console.log('❌ Missing required fields:', { name: !!name, email: !!email, phone: !!phone, password: !!password });
    return res.status(400).json({ message: 'Name, email, phone and password are required' });
  }

  try {
    console.log('📧 Processing registration for email:', email);
    
    // Test database connection first
    console.log('🔍 Testing database connection...');
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected, state:', mongoose.connection.readyState);
      return res.status(500).json({ 
        message: 'Database connection error. Please try again later.',
        debug: process.env.NODE_ENV === 'development' ? `DB State: ${mongoose.connection.readyState}` : undefined
      });
    }
    console.log('✅ Database connection confirmed');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('👤 Existing user found:', { email: existingUser.email, verified: existingUser.isEmailVerified });
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ message: 'User already exists with this email' });
      } else {
        // User exists but email not verified, delete old user and create new
        await User.deleteOne({ _id: existingUser._id });
        await OTP.deleteMany({ email: email.toLowerCase().trim(), purpose: 'register' });
        console.log('🗑️ Removed unverified user and old OTPs');
      }
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // ALL registered users are ALWAYS regular users by default
    // Admin accounts must be created manually in the database
    // This ensures no automatic admin assignment ever occurs
    const userRole = 'user';
    
    console.log('🔒 Creating new user with role:', userRole, 'for email:', email);

    // Create new user (not verified yet)
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      role: userRole,
      isEmailVerified: false
    });

    await user.save();
    console.log('📝 User created:', { id: user._id, email: user.email, name: user.name, role: user.role });
    console.log('✅ Confirmed user role is:', user.role);

    // Generate and send OTP for email verification
    const otpCode = OTP.generateOTP();
    console.log('🔢 Generated OTP:', otpCode, 'for email:', email);

    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ email: email.toLowerCase().trim(), purpose: 'register' });
    console.log('🗑️ Cleaned up existing OTPs for:', email);

    // Save OTP to database
    const otpRecord = new OTP({
      email: email.toLowerCase().trim(),
      otp: otpCode,
      purpose: 'register'
    });

    await otpRecord.save();
    console.log('💾 OTP saved to database:', { id: otpRecord._id, email: otpRecord.email, otp: otpRecord.otp });

    // Send verification SMS - REQUIRED
    console.log('� Attempting to send verification SMS...');
    
    try {
      const smsResult = await twilioService.sendOTP(phone, name);
      console.log('✅ OTP SMS sent successfully');
      
      // SMS sent successfully - normal flow
      res.status(201).json({ 
        message: 'Registration initiated! Please check your phone and verify your account with the OTP we sent via SMS.',
        requiresVerification: true,
        phone: phone.replace(/(\+\d{2})(\d{6})(\d+)/, '$1******$3'),
        userId: user._id
      });
    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      
      // Clean up created records since SMS is required
      console.log('🗑️ Cleaning up user and OTP records due to SMS failure...');
      await User.deleteOne({ _id: user._id });
      await OTP.deleteOne({ _id: otpRecord._id });
      
      res.status(503).json({
        message: 'Registration failed: Unable to send verification SMS. Please try again later.',
        error: 'SMS_SERVICE_UNAVAILABLE',
        details: process.env.NODE_ENV === 'development' ? error.message : 'SMS service temporarily unavailable'
      });
    }

  } catch (err) {
    console.error('❌ Registration error:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Verify registration OTP and complete account creation
exports.verifyRegistrationOTP = async (req, res) => {
  const { email, otp } = req.body;

  console.log('📧 OTP Verification Request:', { email, otp, otpLength: otp?.length });

  if (!email || !otp) {
    console.log('❌ Missing email or OTP');
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOTP = otp.toString().trim();

    // Find the user account
    console.log('🔍 Looking for user account:', { email: normalizedEmail });
    
    const user = await User.findOne({ email: normalizedEmail, isEmailVerified: false });
    console.log('� User lookup:', user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified
    } : 'NOT FOUND');
    
    if (!user) {
      console.log('❌ User account not found');
      return res.status(404).json({ message: 'User account not found. Please register again.' });
    }

    // Verify OTP using Twilio Verify API
    console.log('🔐 Verifying OTP via Twilio for phone:', user.phone);
    
    try {
      const verificationResult = await twilioService.verifyOTP(user.phone, normalizedOTP);
      console.log('✅ Twilio verification result:', verificationResult);
      
      if (!verificationResult.valid) {
        console.log('❌ Twilio OTP verification failed');
        return res.status(400).json({ 
          message: 'Invalid verification code. Please check the SMS and try again.' 
        });
      }
      
      console.log('✅ OTP verified successfully via Twilio, activating user...');
      
    } catch (error) {
      console.error('❌ Twilio OTP verification error:', error.message);
      return res.status(400).json({ 
        message: 'Invalid or expired verification code. Please try again.' 
      });
    }

    // OTP is correct - verify the user account
    console.log('✅ Marking user as verified...');
    console.log('👤 User role before verification:', user.role);
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
    console.log('👤 User role after verification:', user.role);

    // Clean up any old OTP records
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'register' });

    console.log('🎉 User verification complete, generating token...');

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email,
        name: user.name
      }, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '8h' }
    );

    const message = user.role === 'admin' ? 
      'Email verified! Welcome Admin to TVM Academy!' : 
      'Email verified! Welcome to TVM Academy!';

    console.log('✅ Verification successful for:', user.email, 'as', user.role);

    res.json({ 
      message,
      verified: true,
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isEmailVerified: true
      } 
    });

  } catch (err) {
    console.error('❌ Verify registration OTP error:', err);
    res.status(500).json({ message: 'Server error while verifying email' });
  }
};

// Resend registration verification OTP
exports.resendRegistrationOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find unverified user
    const user = await User.findOne({ email: normalizedEmail, isEmailVerified: false });
    if (!user) {
      return res.status(404).json({ message: 'No pending registration found for this email address' });
    }

    console.log('🔄 Resending OTP via SMS for user:', { email: user.email, phone: user.phone });

    // Send verification SMS using Twilio
    try {
      const smsResult = await twilioService.sendOTP(user.phone, user.name);
      console.log('✅ OTP SMS resent successfully');
      
      // Clean up any old OTP records (not needed for Twilio but good housekeeping)
      await OTP.deleteMany({ email: normalizedEmail, purpose: 'register' });
      
      res.json({ 
        message: 'Verification code resent successfully via SMS',
        phone: user.phone.replace(/(\+\d{2})(\d{6})(\d+)/, '$1******$3') // Mask phone for security
      });
    } catch (error) {
      console.error('❌ SMS resend failed:', error.message);
      res.status(503).json({
        message: 'Failed to resend verification SMS. Please try again later.',
        error: 'SMS_SERVICE_UNAVAILABLE'
      });
    }

  } catch (err) {
    console.error('Resend registration OTP error:', err);
    res.status(500).json({ message: 'Server error while resending verification code' });
  }
};

// Step 1: Send OTP for login
exports.sendOTP = async (req, res) => {
  console.log('🚀 Send OTP endpoint called with body:', req.body);
  
  const { email } = req.body;
  
  if (!email) {
    console.log('❌ Missing email in request');
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log('📧 Processing send OTP for email:', normalizedEmail);
    
    // Check environment variables first
    console.log('🔧 Environment check:', {
      EMAIL_HOST: process.env.EMAIL_HOST ? 'SET' : 'NOT_SET',
      EMAIL_PORT: process.env.EMAIL_PORT ? 'SET' : 'NOT_SET', 
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT_SET',
      EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD ? 'SET' : 'NOT_SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
    });

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error('❌ Missing email configuration in environment variables');
      return res.status(500).json({ 
        message: 'Email service is not properly configured. Please contact administrator.',
        debug: process.env.NODE_ENV === 'development' ? 'Missing EMAIL_HOST, EMAIL_USER, or EMAIL_APP_PASSWORD' : undefined
      });
    }
    
    // Check if user exists
    console.log('👤 Looking up user with email:', normalizedEmail);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('❌ No user found with email:', normalizedEmail);
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    console.log('✅ User found:', { id: user._id, email: user.email, verified: user.isEmailVerified });

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('❌ User email not verified:', normalizedEmail);
      return res.status(403).json({ 
        message: 'Please verify your email address first before logging in',
        requiresEmailVerification: true 
      });
    }

    // Delete any existing OTPs for this email
    console.log('🗑️ Cleaning up existing OTPs for:', normalizedEmail);
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'login' });

    // Generate new OTP
    const otpCode = OTP.generateOTP();
    console.log('🔢 Generated OTP code:', otpCode);

    // Save OTP to database
    const otpRecord = new OTP({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'login'
    });

    console.log('💾 Saving OTP to database...');
    await otpRecord.save();
    console.log('✅ OTP saved successfully');

    // Send OTP email
    console.log('📤 Sending OTP email...');
    const emailResult = await emailService.sendOTP(normalizedEmail, otpCode, user.name);
    console.log('📧 Email send result:', emailResult);

    if (emailResult.success) {
      console.log('✅ OTP sent successfully to:', normalizedEmail);
      res.json({ 
        message: 'OTP sent successfully to your email address',
        email: normalizedEmail.replace(/(.{2}).*@/, '$1***@') // Mask email for security
      });
    } else {
      console.error('❌ Email send failed, cleaning up OTP...');
      await OTP.deleteOne({ _id: otpRecord._id }); // Clean up if email fails
      res.status(500).json({ 
        message: 'Failed to send OTP. Please try again.',
        error: emailResult.error || 'Unknown email error'
      });
    }

  } catch (err) {
    console.error('❌ Send OTP error:', err);
    res.status(500).json({ 
      message: 'Server error while sending OTP',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Step 2: Verify OTP and complete login
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOTP = otp.toString().trim();

    // Find the OTP record (get the most recent one)
    const otpRecord = await OTP.findOne({ 
      email: normalizedEmail, 
      purpose: 'login',
      verified: false 
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpRecord.otp.toString().trim() !== normalizedOTP) {
      await otpRecord.incrementAttempts();
      const remainingAttempts = 3 - otpRecord.attempts;
      return res.status(400).json({ 
        message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
      });
    }

    // OTP is correct - get user and generate token
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Mark OTP as verified and delete it
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email,
        name: user.name
      }, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '8h' }
    );

    console.log('🔑 Generating token for user:', { id: user._id, email: user.email, role: user.role });

    res.json({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });

  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
};

// Traditional login (password-based) - keeping for backward compatibility
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address first before logging in',
        requiresEmailVerification: true 
      });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ 
      id: user._id, 
      role: user.role,
      email: user.email,
      name: user.name
    }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '8h' });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Password Reset Functionality
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    console.log('🔄 Password reset requested for:', email);

    // Generate reset token (6-digit OTP)
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOTPExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset OTP
    await OTP.deleteMany({ email: email.toLowerCase().trim(), purpose: 'password-reset' });
    const otpDoc = new OTP({
      email: email.toLowerCase().trim(),
      otp: resetOTP,
      expiresAt: resetOTPExpiry,
      purpose: 'password-reset'
    });
    await otpDoc.save();

    // Send reset email
    try {
      await emailService.sendPasswordResetOTP(email, resetOTP, user.name);
      console.log('📧 Password reset OTP sent to:', email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    res.json({ 
      message: 'If an account with this email exists, a password reset OTP has been sent.',
      otpSent: true
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find and verify OTP
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase().trim(),
      otp: otp.trim(),
      purpose: 'password-reset'
    });

    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otpDoc.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    console.log('✅ Reset OTP verified for:', email);

    // Generate a temporary reset token for password change
    const resetToken = jwt.sign(
      { email: email.toLowerCase().trim(), purpose: 'password-reset' },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '10m' }
    );

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpDoc._id });

    res.json({ 
      message: 'OTP verified successfully. You can now reset your password.',
      resetToken
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secretkey');
    } catch (tokenError) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Find user and update password
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log('🔑 Password reset successfully for:', decoded.email);

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// Admin function to reset student password
exports.adminResetStudentPassword = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newPassword, generateRandomPassword } = req.body;
    
    console.log('🔧 Admin password reset requested for student:', studentId);
    console.log('🔧 Admin user:', req.user);
    
    // Find the student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.role !== 'user') {
      return res.status(400).json({ message: 'Can only reset password for students' });
    }

    let passwordToSet;
    
    if (generateRandomPassword) {
      // Generate random 8-character password
      passwordToSet = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10);
    } else if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      passwordToSet = newPassword;
    } else {
      return res.status(400).json({ message: 'Either provide a new password or request random password generation' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);
    student.password = hashedPassword;
    await student.save();

    console.log('✅ Admin reset password for student:', student.email);

    // Send email to student about password reset
    try {
      await emailService.sendPasswordResetByAdmin(student.email, passwordToSet, student.name);
      console.log('📧 Password reset notification sent to student:', student.email);
    } catch (emailError) {
      console.error('Failed to send password reset notification:', emailError);
    }

    res.json({ 
      message: 'Student password reset successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      },
      newPassword: generateRandomPassword ? passwordToSet : undefined,
      emailSent: true
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
