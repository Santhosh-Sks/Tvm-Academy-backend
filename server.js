require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const seed = require('./config/seed');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enquiryRoutes = require('./routes/enquiries');
const enrollmentRoutes = require('./routes/enrollments');
const reportsRoutes = require('./routes/reports');

const app = express();
// CORS configuration for frontend connections
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Local development
    'https://tvm-academy-frontend.vercel.app',  // Vercel frontend URL pattern
    'https://tvm-academy-frontend-*.vercel.app',  // All Vercel preview deployments
    /^https:\/\/tvm-academy-frontend.*\.vercel\.app$/,  // Regex for all Vercel domains
    /^https:\/\/.*\.vercel\.app$/,  // All Vercel domains for your account
  ],
  credentials: true,  // Allow cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// MongoDB connection with better error handling and timeout
const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tvm-academy';
    
    // Ensure we're using the correct database name
    if (mongoURI.includes('/test?')) {
      mongoURI = mongoURI.replace('/test?', '/tvm-academy?');
      console.log('🔧 Updated database name from "test" to "tvm-academy"');
    }
    
    console.log('🔗 Attempting MongoDB connection...');
    console.log('📡 MongoDB URI (masked):', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      dbName: 'tvm-academy', // Explicitly set database name
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create admin user if needed
    await seed();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('timed out')) {
      console.log(`
🔧 MongoDB Connection Help:
1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Or use MongoDB Atlas (free cloud): https://www.mongodb.com/atlas
3. Update your MONGODB_URI in .env file

For MongoDB Atlas:
- Create account at mongodb.com/atlas
- Create free cluster
- Get connection string
- Add to .env: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tvm-academy
      `);
    }
    
    process.exit(1);
  }
};

// Connect to database
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TVM Academy API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    port: PORT
  });
});

// Debug endpoint for troubleshooting
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'debug',
    message: 'TVM Academy Debug Info',
    environment: process.env.NODE_ENV || 'development',
    mongodb_status: mongoose.connection.readyState,
    mongodb_states: {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    },
    current_state: mongoose.connection.readyState === 1 ? 'connected' : 'not connected',
    database_name: mongoose.connection.name || 'not connected',
    email_config: {
      host: process.env.EMAIL_HOST || 'not set',
      port: process.env.EMAIL_PORT || 'not set',
      user: process.env.EMAIL_USER ? 'set' : 'not set',
      password: process.env.EMAIL_APP_PASSWORD ? 'set' : 'not set',
      password_length: process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.length : 0
    },
    jwt_secret: process.env.JWT_SECRET ? 'set' : 'not set',
    jwt_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    models_loaded: {
      user: 'checking...',
      otp: 'checking...'
    },
    timestamp: new Date().toISOString()
  });
});

// Test email service endpoint with detailed debugging
app.get('/api/test-email', async (req, res) => {
  try {
    const emailService = require('./services/emailService');
    
    // Test email connection
    const connectionTest = await emailService.verifyConnection();
    
    res.json({
      status: 'email test',
      connection: connectionTest ? 'success' : 'failed',
      config: {
        host: process.env.EMAIL_HOST || 'not set',
        port: process.env.EMAIL_PORT || 'not set',
        user: process.env.EMAIL_USER ? 'set' : 'not set',
        password: process.env.EMAIL_APP_PASSWORD ? 'set' : 'not set',
        passwordLength: process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, '').length : 0,
        passwordFirst3: process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.substring(0, 3) + '***' : 'not set'
      },
      initError: emailService.initError,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'email test failed',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Test Gmail authentication directly
app.get('/api/test-gmail', async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    
    // Create a simple Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
      }
    });

    // Test the connection
    const verified = await transporter.verify();
    
    res.json({
      status: 'Gmail test',
      connection: verified ? 'success' : 'failed',
      user: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'not set',
      passwordLength: process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, '').length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      status: 'Gmail test failed',
      error: error.message,
      code: error.code,
      response: error.response,
      timestamp: new Date().toISOString()
    });
  }
});

// Enable registration without email (for testing)
app.post('/api/test-register-no-email', async (req, res) => {
  try {
    const User = require('./models/User');
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this email' });
    }

    // Create user directly (bypass OTP)
    const newUser = new User({
      name,
      email,
      password, // Note: In production, hash this password
      phone,
      isVerified: true, // Skip email verification
      role: 'student'
    });

    await newUser.save();

    res.status(201).json({
      message: 'Registration successful (email bypassed for testing)',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Test registration endpoint (no actual registration)
app.post('/api/test-register', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email required for test' });
    }

    // Test database connection
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    // Test OTP model
    const OTP = require('./models/OTP');
    const otpCount = await OTP.countDocuments();
    
    res.json({
      status: 'test successful',
      message: 'All services are working',
      database: {
        connected: mongoose.connection.readyState === 1,
        users: userCount,
        otps: otpCount
      },
      models: {
        user: 'loaded',
        otp: 'loaded'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'test failed',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Test registration with detailed error logging
app.post('/api/test-register-real', async (req, res) => {
  try {
    console.log('🧪 Testing real registration flow...');
    
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!'
    };
    
    // Step 1: Test User model
    console.log('Step 1: Testing User model...');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    // Step 2: Test password hashing
    console.log('Step 2: Testing password hashing...');
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Step 3: Test database save (without actually saving)
    console.log('Step 3: Testing user object creation...');
    const testUserObj = new User({
      name: testUser.name,
      email: testUser.email,
      password: hashedPassword,
      role: 'user',
      isEmailVerified: false
    });
    
    // Step 4: Test OTP generation
    console.log('Step 4: Testing OTP generation...');
    const OTP = require('./models/OTP');
    const otpCode = OTP.generateOTP();
    
    // Step 5: Test email service
    console.log('Step 5: Testing email service...');
    const emailService = require('./services/emailService');
    
    res.json({
      status: 'registration test successful',
      steps: {
        userModel: 'loaded',
        passwordHashing: 'working',
        userObjectCreation: 'working',
        otpGeneration: otpCode,
        emailServiceLoaded: 'working'
      },
      message: 'All registration components are working',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Registration test error:', error);
    res.status(500).json({
      status: 'registration test failed',
      error: error.message,
      stack: error.stack,
      step: 'Failed during test',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok', 
    message: 'TVM Academy API is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    endpoints: {
      health: '/api/health',
      debug: '/api/debug',
      'test-email': '/api/test-email',
      register: '/api/auth/register (POST)'
    }
  });
});

// Simple connectivity test
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    message: 'Server is reachable',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
