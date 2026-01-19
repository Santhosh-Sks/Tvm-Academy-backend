console.log('🚀 Starting TVM Academy Server...');
console.log('📁 Working directory:', process.cwd());
console.log('🌐 Node.js version:', process.version);

try {
  // Load environment variables
  require('dotenv').config();
  console.log('✅ Environment variables loaded');
  console.log('🔐 MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
  console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? 'Present' : 'Missing');
  
  // Try to load server
  require('./server.js');
} catch (error) {
  console.error('❌ Server startup failed:', error.message);
  console.error('📋 Error stack:', error.stack);
  process.exit(1);
}
