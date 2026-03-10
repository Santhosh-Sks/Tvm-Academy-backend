// Script to create admin user manually
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tvm-academy';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

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
