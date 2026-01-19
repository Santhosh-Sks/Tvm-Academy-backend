require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Enquiry = require('./models/Enquiry');

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

// Create sample data
const createSampleData = async () => {
  try {
    console.log('🚀 Creating sample enrollment data...');

    // Check if we already have enrollments
    const existingEnrollments = await Enrollment.countDocuments();
    if (existingEnrollments > 0) {
      console.log('✅ Sample enrollment data already exists!');
      console.log(`📊 Found ${existingEnrollments} existing enrollments`);
      return;
    }

    // Get or create sample users
    let sampleUsers = await User.find({ role: 'user' }).limit(10);
    if (sampleUsers.length === 0) {
      console.log('📝 Creating sample users...');
      const userPromises = [];
      for (let i = 1; i <= 10; i++) {
        userPromises.push(User.create({
          name: `Student ${i}`,
          email: `student${i}@example.com`,
          password: 'hashedPassword123', // In real app, this would be properly hashed
          role: 'user',
          isEmailVerified: true
        }));
      }
      sampleUsers = await Promise.all(userPromises);
    }

    // Get or create sample courses
    let sampleCourses = await Course.find().limit(5);
    if (sampleCourses.length === 0) {
      console.log('📝 Creating sample courses...');
      const coursePromises = [
        Course.create({
          title: 'Web Development Fundamentals',
          description: 'Learn HTML, CSS, and JavaScript basics',
          price: 15000,
          duration: '3 months',
          instructor: 'John Smith',
          status: 'active'
        }),
        Course.create({
          title: 'React.js Masterclass',
          description: 'Advanced React.js development course',
          price: 25000,
          duration: '4 months',
          instructor: 'Jane Doe',
          status: 'active'
        }),
        Course.create({
          title: 'Node.js Backend Development',
          description: 'Server-side development with Node.js',
          price: 20000,
          duration: '3 months',
          instructor: 'Mike Johnson',
          status: 'active'
        }),
        Course.create({
          title: 'Python Programming',
          description: 'Complete Python programming course',
          price: 18000,
          duration: '2 months',
          instructor: 'Sarah Wilson',
          status: 'active'
        }),
        Course.create({
          title: 'Data Science with Python',
          description: 'Data analysis and machine learning',
          price: 30000,
          duration: '6 months',
          instructor: 'David Brown',
          status: 'active'
        })
      ];
      sampleCourses = await Promise.all(coursePromises);
    }

    console.log(`👥 Using ${sampleUsers.length} users and ${sampleCourses.length} courses`);

    // Create sample enrollments for different months
    const enrollments = [];
    const currentDate = new Date();
    
    // Current month enrollments (more recent)
    for (let i = 0; i < 15; i++) {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const randomCourse = sampleCourses[Math.floor(Math.random() * sampleCourses.length)];
      const daysAgo = Math.floor(Math.random() * 30); // Random day this month
      const enrollmentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - daysAgo);
      
      try {
        enrollments.push({
          userId: randomUser._id,
          courseId: randomCourse._id,
          enrollmentDate: enrollmentDate,
          paymentAmount: randomCourse.price + Math.floor(Math.random() * 1000), // Add some variation
          paymentStatus: 'completed',
          paymentMethod: ['card', 'upi', 'netbanking'][Math.floor(Math.random() * 3)],
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          status: 'enrolled',
          progress: Math.floor(Math.random() * 100)
        });
      } catch (error) {
        // Skip duplicates
        console.log(`Skipping duplicate enrollment for user ${randomUser.email} and course ${randomCourse.title}`);
      }
    }

    // Last month enrollments
    for (let i = 0; i < 10; i++) {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const randomCourse = sampleCourses[Math.floor(Math.random() * sampleCourses.length)];
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, Math.floor(Math.random() * 28) + 1);
      
      enrollments.push({
        userId: randomUser._id,
        courseId: randomCourse._id,
        enrollmentDate: lastMonth,
        paymentAmount: randomCourse.price,
        paymentStatus: 'completed',
        paymentMethod: ['card', 'upi', 'netbanking'][Math.floor(Math.random() * 3)],
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: 'enrolled',
        progress: Math.floor(Math.random() * 100)
      });
    }

    // Two months ago enrollments
    for (let i = 0; i < 8; i++) {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const randomCourse = sampleCourses[Math.floor(Math.random() * sampleCourses.length)];
      const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, Math.floor(Math.random() * 28) + 1);
      
      enrollments.push({
        userId: randomUser._id,
        courseId: randomCourse._id,
        enrollmentDate: twoMonthsAgo,
        paymentAmount: randomCourse.price,
        paymentStatus: 'completed',
        paymentMethod: ['card', 'upi', 'netbanking'][Math.floor(Math.random() * 3)],
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: 'enrolled',
        progress: Math.floor(Math.random() * 100)
      });
    }

    // Insert enrollments one by one to avoid duplicate key errors
    let successCount = 0;
    for (const enrollment of enrollments) {
      try {
        await Enrollment.create(enrollment);
        successCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log('Skipping duplicate enrollment...');
        } else {
          console.error('Error creating enrollment:', error.message);
        }
      }
    }

    // Create some sample enquiries
    const enquiries = [];
    for (let i = 0; i < 5; i++) {
      enquiries.push({
        name: `Enquiry Student ${i + 1}`,
        email: `enquiry${i + 1}@example.com`,
        phone: `+91987654${String(3210 + i)}`,
        message: `Interested in course information - enquiry ${i + 1}`,
        status: i < 2 ? 'new' : 'contacted'
      });
    }

    await Enquiry.insertMany(enquiries);

    console.log('✅ Sample data created successfully!');
    console.log(`📊 Created ${successCount} enrollments`);
    console.log(`📞 Created ${enquiries.length} enquiries`);
    console.log(`👥 Total users: ${sampleUsers.length}`);
    console.log(`📚 Total courses: ${sampleCourses.length}`);
    
    // Display summary stats
    const totalEnrollments = await Enrollment.countDocuments();
    const totalRevenue = await Enrollment.aggregate([
      { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
    ]);
    
    console.log('\n📈 Database Summary:');
    console.log(`Total Enrollments: ${totalEnrollments}`);
    console.log(`Total Revenue: ₹${totalRevenue[0]?.total?.toLocaleString() || 0}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await createSampleData();
};

main();
