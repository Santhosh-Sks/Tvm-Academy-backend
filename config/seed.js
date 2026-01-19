// simple seed to create an admin user if none exists
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seed = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    // No demo credentials created automatically
    // Admin users should be created manually through registration
    console.log('No users found. Please register an admin user through the web interface.');
  }
};

module.exports = seed;
