require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tvm-academy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Reset admin password
const resetAdminPassword = async () => {
  try {
    // New password
    const newPassword = 'admin123'; // Change this to your desired password
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Find and update the admin user
    const admin = await User.findOneAndUpdate(
      { role: 'admin' },
      { password: hashedPassword },
      { new: true }
    );
    
    if (admin) {
      console.log('✅ Admin password reset successfully!');
      console.log(`📧 Admin Email: ${admin.email}`);
      console.log(`🔑 New Password: ${newPassword}`);
      console.log('⚠️  Please change this password after logging in');
    } else {
      console.log('❌ No admin user found. Creating new admin user...');
      
      // Create new admin user
      const newAdmin = new User({
        name: 'TVM Admin',
        email: 'admin@tvm.ac.in',
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log('✅ New admin user created!');
      console.log(`📧 Admin Email: admin@tvm.ac.in`);
      console.log(`🔑 Password: ${newPassword}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await resetAdminPassword();
};

main();
