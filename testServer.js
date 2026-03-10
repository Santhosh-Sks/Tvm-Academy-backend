// Server Connection Test
// Run this with: node testServer.js

const testServerConnection = async () => {
  try {
    console.log('🔍 Testing server connection...');
    
    // Test basic server
    const basicResponse = await fetch('http://localhost:5000/');
    const basicData = await basicResponse.json();
    console.log('✅ Basic server response:', basicData);
    
    // Test enrollments endpoint without auth
    try {
      const enrollmentsResponse = await fetch('http://localhost:5000/api/enrollments/test');
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        console.log('✅ Enrollments test endpoint:', enrollmentsData);
      } else {
        console.log('❌ Enrollments test endpoint status:', enrollmentsResponse.status);
      }
    } catch (error) {
      console.log('❌ Enrollments test endpoint error:', error.message);
    }
    
    // Test admin endpoint (should fail without auth)
    try {
      const adminResponse = await fetch('http://localhost:5000/api/enrollments/admin/all');
      console.log('🔐 Admin endpoint status (should be 401):', adminResponse.status);
      const adminData = await adminResponse.text();
      console.log('🔐 Admin endpoint response:', adminData);
    } catch (error) {
      console.log('❌ Admin endpoint error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running (npm start in server directory)');
    console.log('2. Check if port 5000 is available');
    console.log('3. Verify MongoDB connection');
  }
};

testServerConnection();
