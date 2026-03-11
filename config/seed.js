// simple seed to create an admin user if none exists
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    const count = await User.countDocuments();
    console.log(`📊 Current user count: ${count}`);
    
    if (count === 0) {
      // Create default admin user
      const defaultAdmin = {
        name: 'TVM Admin',
        email: 'admin@tvmacademy.com',
        phone: '9999999999',
        password: 'Admin@123',
        role: 'admin',
        isEmailVerified: true // Admin is pre-verified
      };

      console.log('👤 Creating default admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
      
      const admin = new User({
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        phone: defaultAdmin.phone,
        password: hashedPassword,
        role: defaultAdmin.role,
        isEmailVerified: defaultAdmin.isEmailVerified
      });

      await admin.save();
      
      console.log('✅ Default admin user created successfully!');
      console.log('📧 Admin Email:', defaultAdmin.email);
      console.log('🔐 Admin Password:', defaultAdmin.password);
      console.log('⚠️  Please change the admin password after first login!');
    } else {
      console.log('✅ Users exist in database, skipping admin creation');
    }
  } catch (error) {
    console.error('❌ Error in seed process:', error.message);
  }
};

module.exports = seed;
