// Script to create admin user manually
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    // Connect to MongoDB with correct database
    let mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tvm-academy';
    
    // Ensure we're using the correct database name
    if (mongoURI.includes('/test?')) {
      mongoURI = mongoURI.replace('/test?', '/tvm-academy?');
      console.log('🔧 Updated database name from "test" to "tvm-academy"');
    }
    
    console.log('🔗 Connecting to MongoDB...');
    console.log('📡 MongoDB URI (masked):', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(mongoURI, {
      dbName: 'tvm-academy' // Explicitly set database name
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@tvmacademy.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔐 Role:', existingAdmin.role);
      return;
    }

    // Create new admin user
    const adminData = {
      name: 'TVM Admin',
      email: 'admin@tvmacademy.com',
      password: 'Admin@123',
      role: 'admin',
      isEmailVerified: true
    };

    console.log('👤 Creating admin user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    const admin = new User({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      isEmailVerified: adminData.isEmailVerified
    });

    await admin.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log('='.repeat(50));
    console.log('📧 Email:', adminData.email);
    console.log('🔐 Password:', adminData.password);
    console.log('👤 Role:', adminData.role);
    console.log('='.repeat(50));
    console.log('⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createAdmin();
