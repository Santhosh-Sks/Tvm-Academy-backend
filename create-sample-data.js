require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Enquiry = require('./models/Enquiry');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tvm-academy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample data
const createSampleData = async () => {
  try {
    console.log('🚀 Creating sample data...');

    // Create sample users (students)
    const sampleUsers = [
      {
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        isEmailVerified: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        isEmailVerified: true
      },
      {
        name: 'Amit Singh',
        email: 'amit@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        isEmailVerified: true
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        isEmailVerified: true
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        isEmailVerified: true
      }
    ];

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} sample users`);

    // Create sample courses
    const sampleCourses = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        instructor: 'TVM Academy',
        duration: '4 weeks',
        level: 'beginner',
        price: 2999,
        category: 'Programming',
        status: 'active'
      },
      {
        title: 'React.js Complete Course',
        description: 'Build modern web applications with React',
        instructor: 'TVM Academy',
        duration: '8 weeks',
        level: 'intermediate',
        price: 4999,
        category: 'Web Development',
        status: 'active'
      },
      {
        title: 'Node.js Backend Development',
        description: 'Server-side development with Node.js',
        instructor: 'TVM Academy',
        duration: '6 weeks',
        level: 'intermediate',
        price: 3999,
        category: 'Backend Development',
        status: 'active'
      },
      {
        title: 'Full Stack Web Development',
        description: 'Complete web development bootcamp',
        instructor: 'TVM Academy',
        duration: '12 weeks',
        level: 'advanced',
        price: 8999,
        category: 'Full Stack',
        status: 'active'
      },
      {
        title: 'Python for Data Science',
        description: 'Data analysis and visualization with Python',
        instructor: 'TVM Academy',
        duration: '10 weeks',
        level: 'intermediate',
        price: 5999,
        category: 'Data Science',
        status: 'active'
      }
    ];

    const createdCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ Created ${createdCourses.length} sample courses`);

    // Create sample enrollments for last few months
    const enrollments = [];
    const now = new Date();

    // Function to get random date within a month
    const getRandomDateInMonth = (year, month) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Create enrollments for current month and last 3 months
    for (let monthOffset = 0; monthOffset < 4; monthOffset++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const enrollmentsInMonth = Math.floor(Math.random() * 15) + 5; // 5-20 enrollments per month

      for (let i = 0; i < enrollmentsInMonth; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomCourse = createdCourses[Math.floor(Math.random() * createdCourses.length)];
        
        try {
          const enrollment = {
            userId: randomUser._id,
            courseId: randomCourse._id,
            enrollmentDate: getRandomDateInMonth(targetDate.getFullYear(), targetDate.getMonth()),
            paymentAmount: randomCourse.price,
            paymentStatus: Math.random() > 0.1 ? 'completed' : 'pending', // 90% completed
            paymentMethod: ['card', 'upi', 'netbanking'][Math.floor(Math.random() * 3)],
            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            status: 'enrolled'
          };

          enrollments.push(enrollment);
        } catch (error) {
          // Skip duplicate enrollments (user already enrolled in course)
          console.log(`Skipping duplicate enrollment for user ${randomUser.email} in course ${randomCourse.title}`);
        }
      }
    }

    // Insert enrollments
    try {
      const createdEnrollments = await Enrollment.insertMany(enrollments);
      console.log(`✅ Created ${createdEnrollments.length} sample enrollments`);
    } catch (error) {
      console.log('⚠️ Some enrollments skipped due to duplicates');
      // Try to insert one by one to handle duplicates
      let successCount = 0;
      for (const enrollment of enrollments) {
        try {
          await new Enrollment(enrollment).save();
          successCount++;
        } catch (err) {
          // Skip duplicates
        }
      }
      console.log(`✅ Created ${successCount} sample enrollments (some duplicates skipped)`);
    }

    // Create sample enquiries
    const sampleEnquiries = [
      {
        name: 'Arjun Verma',
        email: 'arjun@example.com',
        phone: '9876543210',
        course: 'Machine Learning Course',
        message: 'Interested in machine learning bootcamp',
        status: 'new'
      },
      {
        name: 'Deepika Rao',
        email: 'deepika@example.com',
        phone: '9876543211',
        course: 'Digital Marketing',
        message: 'Want to know about digital marketing courses',
        status: 'contacted'
      },
      {
        name: 'Karthik Nair',
        email: 'karthik@example.com',
        phone: '9876543212',
        course: 'UI/UX Design',
        message: 'Looking for UI/UX design course',
        status: 'new'
      }
    ];

    const createdEnquiries = await Enquiry.insertMany(sampleEnquiries);
    console.log(`✅ Created ${createdEnquiries.length} sample enquiries`);

    console.log('\n🎉 Sample data creation completed successfully!');
    console.log('\n📊 Dashboard should now show:');
    console.log('• Enrollment statistics');
    console.log('• Revenue data');
    console.log('• Course and student counts');
    console.log('• Pending enquiries');
    console.log('\n💡 You can now test the Reports dashboard!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await createSampleData();
  process.exit(0);
};

main();
