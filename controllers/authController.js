const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ message: 'User already exists with this email' });
      } else {
        // User exists but email not verified, delete old user and create new
        await User.deleteOne({ _id: existingUser._id });
        await OTP.deleteMany({ email: email.toLowerCase().trim(), purpose: 'register' });
      }
    }

    // Hash password
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

    // Send verification email
    const emailResult = await emailService.sendRegistrationOTP(email, otpCode, name);

    if (emailResult.success) {
      res.status(201).json({ 
        message: 'Registration initiated! Please check your email and verify your account with the OTP we sent.',
        requiresVerification: true,
        email: email.replace(/(.{2}).*@/, '$1***@'), // Mask email for security
        userId: user._id
      });
    } else {
      // If email fails, delete the user
      await User.deleteOne({ _id: user._id });
      await OTP.deleteOne({ _id: otpRecord._id });
      res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
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

    // Find the OTP record (get the most recent one)
    console.log('🔍 Looking for OTP record:', { email: normalizedEmail, purpose: 'register' });
    
    const otpRecord = await OTP.findOne({ 
      email: normalizedEmail, 
      purpose: 'register',
      verified: false 
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    console.log('📋 OTP Record found:', otpRecord ? {
      id: otpRecord._id,
      email: otpRecord.email,
      otp: otpRecord.otp,
      attempts: otpRecord.attempts,
      createdAt: otpRecord.createdAt,
      purpose: otpRecord.purpose
    } : 'NOT FOUND');

    if (!otpRecord) {
      console.log('❌ No OTP record found for verification');
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Check if OTP is expired
    const isExpired = otpRecord.isExpired();
    console.log('⏰ OTP Expiry Check:', { isExpired, createdAt: otpRecord.createdAt, now: new Date() });
    
    if (isExpired) {
      console.log('❌ OTP has expired, cleaning up...');
      await OTP.deleteOne({ _id: otpRecord._id });
      await User.deleteOne({ email: normalizedEmail, isEmailVerified: false });
      return res.status(400).json({ message: 'Verification code has expired. Please register again.' });
    }

    // Check if too many attempts
    console.log('🔢 Attempt Check:', { attempts: otpRecord.attempts, maxAttempts: 3 });
    
    if (otpRecord.attempts >= 3) {
      console.log('❌ Too many attempts, cleaning up...');
      await OTP.deleteOne({ _id: otpRecord._id });
      await User.deleteOne({ email: normalizedEmail, isEmailVerified: false });
      return res.status(400).json({ message: 'Too many failed attempts. Please register again.' });
    }

    // Verify OTP
    const storedOTP = otpRecord.otp.toString().trim();
    
    console.log('🔐 OTP Comparison:', { 
      provided: normalizedOTP, 
      stored: storedOTP, 
      match: normalizedOTP === storedOTP,
      providedLength: normalizedOTP.length,
      storedLength: storedOTP.length
    });
    
    if (storedOTP !== normalizedOTP) {
      console.log('❌ OTP mismatch, incrementing attempts...');
      await otpRecord.incrementAttempts();
      const remainingAttempts = 3 - (otpRecord.attempts + 1);
      return res.status(400).json({ 
        message: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
      });
    }

    console.log('✅ OTP verified successfully, activating user...');

    // OTP is correct - verify the user account
    const user = await User.findOne({ email: normalizedEmail, isEmailVerified: false });
    console.log('👤 User lookup:', user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified
    } : 'NOT FOUND');
    
    if (!user) {
      console.log('❌ User account not found, cleaning up...');
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(404).json({ message: 'User account not found. Please register again.' });
    }

    // Mark user as verified
    console.log('✅ Marking user as verified...');
    console.log('👤 User role before verification:', user.role);
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
    console.log('👤 User role after verification:', user.role);

    // Delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    console.log('🎉 User verification complete, generating token...');

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
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

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'register' });

    // Generate new OTP
    const otpCode = OTP.generateOTP();
    console.log('🔄 Resending OTP:', otpCode, 'for email:', normalizedEmail);

    // Save OTP to database
    const otpRecord = new OTP({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'register'
    });

    await otpRecord.save();

    // Send verification email
    const emailResult = await emailService.sendRegistrationOTP(normalizedEmail, otpCode, user.name);

    if (emailResult.success) {
      res.json({ 
        message: 'Verification code resent successfully',
        email: normalizedEmail.replace(/(.{2}).*@/, '$1***@') // Mask email for security
      });
    } else {
      await OTP.deleteOne({ _id: otpRecord._id }); // Clean up if email fails
      res.status(500).json({ message: 'Failed to resend verification code. Please try again.' });
    }

  } catch (err) {
    console.error('Resend registration OTP error:', err);
    res.status(500).json({ message: 'Server error while resending verification code' });
  }
};

// Step 1: Send OTP for login
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address first before logging in',
        requiresEmailVerification: true 
      });
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'login' });

    // Generate new OTP
    const otpCode = OTP.generateOTP();

    // Save OTP to database
    const otpRecord = new OTP({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'login'
    });

    await otpRecord.save();

    // Send OTP email
    const emailResult = await emailService.sendOTP(normalizedEmail, otpCode, user.name);

    if (emailResult.success) {
      res.json({ 
        message: 'OTP sent successfully to your email address',
        email: normalizedEmail.replace(/(.{2}).*@/, '$1***@') // Mask email for security
      });
    } else {
      await OTP.deleteOne({ _id: otpRecord._id }); // Clean up if email fails
      res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Server error while sending OTP' });
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
      { id: user._id, role: user.role }, 
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
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '8h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
