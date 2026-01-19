const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');

const enhancedCourses = [
  {
    title: 'Full Stack Web Development with MERN',
    shortDescription: 'Master modern web development with MongoDB, Express.js, React, and Node.js',
    fullDescription: 'This comprehensive course will take you from beginner to advanced level in full-stack web development. You\'ll learn to build complete web applications using the MERN stack (MongoDB, Express.js, React, Node.js). The course covers everything from setting up your development environment to deploying production-ready applications to the cloud.',
    description: 'Learn to build complete web applications using MongoDB, Express.js, React, and Node.js',
    duration: '6 months',
    fee: 25000,
    level: 'Intermediate',
    category: 'Web Development',
    programmingLanguages: ['JavaScript', 'HTML', 'CSS', 'ES6+'],
    tools: ['VS Code', 'Git', 'GitHub', 'MongoDB Compass', 'Postman', 'Chrome DevTools'],
    technologies: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'RESTful APIs', 'JWT'],
    frameworks: ['Express.js', 'React.js', 'Bootstrap', 'Mongoose'],
    syllabus: [
      {
        module: 'Frontend Development with React',
        duration: '2 months',
        topics: [
          'JavaScript ES6+ fundamentals',
          'React components and JSX',
          'State management with hooks',
          'React Router for navigation',
          'API integration and data fetching',
          'Responsive design with CSS'
        ]
      },
      {
        module: 'Backend Development with Node.js',
        duration: '2 months',
        topics: [
          'Node.js and npm basics',
          'Express.js server setup',
          'RESTful API design',
          'Authentication and authorization',
          'File upload and processing',
          'Error handling and validation'
        ]
      },
      {
        module: 'Database with MongoDB',
        duration: '1 month',
        topics: [
          'MongoDB fundamentals',
          'Mongoose ODM',
          'Database design and relationships',
          'Data validation and indexing',
          'Aggregation and queries',
          'Database optimization'
        ]
      },
      {
        module: 'Full Stack Integration & Deployment',
        duration: '1 month',
        topics: [
          'Connecting frontend and backend',
          'State management with Context API',
          'Testing with Jest and React Testing Library',
          'Deployment to Heroku and Netlify',
          'Environment variables and security',
          'Performance optimization'
        ]
      }
    ],
    prerequisites: [
      'Basic HTML and CSS knowledge',
      'Basic programming concepts',
      'Familiarity with command line'
    ],
    learningOutcomes: [
      'Build complete full-stack web applications',
      'Create responsive and interactive user interfaces',
      'Develop RESTful APIs and backend services',
      'Work with databases and data modeling',
      'Deploy applications to production',
      'Follow modern development practices'
    ],
    instructor: {
      name: 'Rajesh Kumar',
      bio: 'Senior Full Stack Developer with 8+ years of experience in web development',
      experience: '8+ years in MERN stack development',
      expertise: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Cloud Deployment']
    },
    maxStudents: 25,
    currentEnrollments: 18
  },
  {
    title: 'React.js Frontend Development',
    shortDescription: 'Build modern, interactive user interfaces with React.js and contemporary tools',
    fullDescription: 'Dive deep into React.js, the most popular JavaScript library for building user interfaces. This course covers everything from basic components to advanced patterns, state management, and modern React features like hooks. You\'ll build several real-world projects and learn industry best practices.',
    description: 'Master React.js for building modern user interfaces',
    duration: '3 months',
    fee: 15000,
    level: 'Beginner',
    category: 'Web Development',
    programmingLanguages: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
    tools: ['VS Code', 'Create React App', 'Vite', 'React DevTools', 'npm/yarn'],
    technologies: ['React.js', 'JSX', 'Virtual DOM', 'React Router', 'Context API'],
    frameworks: ['React.js', 'Next.js', 'Material-UI', 'Styled Components'],
    syllabus: [
      {
        module: 'React Fundamentals',
        duration: '1 month',
        topics: [
          'Components and JSX',
          'Props and state',
          'Event handling',
          'Lists and keys',
          'Forms and controlled components',
          'Lifecycle methods'
        ]
      },
      {
        module: 'Advanced React',
        duration: '1 month',
        topics: [
          'React Hooks (useState, useEffect, useContext)',
          'Custom hooks',
          'State management patterns',
          'Performance optimization',
          'Error boundaries',
          'Code splitting and lazy loading'
        ]
      },
      {
        module: 'React Ecosystem',
        duration: '1 month',
        topics: [
          'React Router for routing',
          'API integration with Axios',
          'Form handling with Formik',
          'UI libraries (Material-UI, Ant Design)',
          'Testing with Jest and React Testing Library',
          'Deployment strategies'
        ]
      }
    ],
    prerequisites: [
      'Strong JavaScript fundamentals',
      'HTML and CSS proficiency',
      'Basic understanding of ES6+'
    ],
    learningOutcomes: [
      'Build complex React applications',
      'Implement modern React patterns',
      'Manage application state effectively',
      'Optimize React app performance',
      'Test React components',
      'Deploy React applications'
    ],
    instructor: {
      name: 'Priya Sharma',
      bio: 'Frontend specialist with expertise in React ecosystem and modern web development',
      experience: '5+ years in Frontend development',
      expertise: ['React.js', 'JavaScript', 'TypeScript', 'UI/UX Design']
    },
    maxStudents: 30,
    currentEnrollments: 22
  },
  {
    title: 'Python for Data Science and Machine Learning',
    shortDescription: 'Learn Python programming for data analysis, visualization, and machine learning',
    fullDescription: 'This comprehensive course introduces you to Python programming specifically for data science and machine learning applications. You\'ll learn to analyze data, create visualizations, and build machine learning models using popular Python libraries like Pandas, NumPy, Matplotlib, and Scikit-learn.',
    description: 'Master Python for data analysis and machine learning',
    duration: '4 months',
    fee: 20000,
    level: 'Beginner',
    category: 'Data Science',
    programmingLanguages: ['Python'],
    tools: ['Jupyter Notebook', 'Anaconda', 'Google Colab', 'PyCharm', 'Git'],
    technologies: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn', 'TensorFlow'],
    frameworks: ['Scikit-learn', 'TensorFlow', 'Keras', 'Flask'],
    syllabus: [
      {
        module: 'Python Programming Fundamentals',
        duration: '1 month',
        topics: [
          'Python syntax and data types',
          'Control structures and functions',
          'Object-oriented programming',
          'File handling and modules',
          'Error handling and debugging',
          'Working with APIs'
        ]
      },
      {
        module: 'Data Analysis with Pandas',
        duration: '1 month',
        topics: [
          'Data manipulation with Pandas',
          'Data cleaning and preprocessing',
          'Working with CSV, JSON, and databases',
          'GroupBy operations and aggregations',
          'Time series analysis',
          'Data merging and joining'
        ]
      },
      {
        module: 'Data Visualization',
        duration: '1 month',
        topics: [
          'Matplotlib fundamentals',
          'Advanced plotting with Seaborn',
          'Interactive visualizations with Plotly',
          'Statistical visualizations',
          'Dashboard creation',
          'Best practices for data presentation'
        ]
      },
      {
        module: 'Machine Learning',
        duration: '1 month',
        topics: [
          'Introduction to machine learning',
          'Supervised learning algorithms',
          'Unsupervised learning techniques',
          'Model evaluation and validation',
          'Feature engineering',
          'Deep learning basics with TensorFlow'
        ]
      }
    ],
    prerequisites: [
      'Basic programming concepts',
      'High school mathematics',
      'Basic statistics knowledge (helpful but not required)'
    ],
    learningOutcomes: [
      'Write efficient Python code for data analysis',
      'Clean and preprocess real-world datasets',
      'Create compelling data visualizations',
      'Build and evaluate machine learning models',
      'Apply statistical analysis techniques',
      'Deploy ML models in production'
    ],
    instructor: {
      name: 'Dr. Ankit Verma',
      bio: 'Data Scientist and ML Engineer with PhD in Computer Science',
      experience: '10+ years in Data Science and AI',
      expertise: ['Python', 'Machine Learning', 'Deep Learning', 'Statistical Analysis']
    },
    maxStudents: 20,
    currentEnrollments: 15
  }
];

async function updateCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tvmacademy');
    console.log('Connected to MongoDB');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Insert enhanced courses
    const savedCourses = await Course.insertMany(enhancedCourses);
    console.log(`✅ Successfully created ${savedCourses.length} enhanced courses:`);
    
    savedCourses.forEach(course => {
      console.log(`- ${course.title} (${course.level} - ${course.category})`);
    });

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error updating courses:', error);
    process.exit(1);
  }
}

updateCourses();
