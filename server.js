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
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection with better error handling and timeout
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tvm-academy';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
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
    email_config: {
      host: process.env.EMAIL_HOST || 'not set',
      port: process.env.EMAIL_PORT || 'not set',
      user: process.env.EMAIL_USER ? 'set' : 'not set',
      password: process.env.EMAIL_APP_PASSWORD ? 'set' : 'not set'
    },
    jwt_secret: process.env.JWT_SECRET ? 'set' : 'not set',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => res.send({status:'ok', message: 'TVM Academy API'}));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
