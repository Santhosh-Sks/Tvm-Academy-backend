const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: String },
  fee: { type: Number },
  
  // Enhanced course details
  shortDescription: { type: String }, // Brief overview for cards
  fullDescription: { type: String }, // Detailed description
  
  // Technical details
  programmingLanguages: [{ type: String }], // ['JavaScript', 'Python', 'React']
  tools: [{ type: String }], // ['VS Code', 'Git', 'Node.js']
  technologies: [{ type: String }], // ['MongoDB', 'Express', 'React', 'Node.js']
  frameworks: [{ type: String }], // ['Express.js', 'React.js', 'Bootstrap']
  
  // Course structure
  syllabus: [{
    module: { type: String },
    topics: [{ type: String }],
    duration: { type: String }
  }],
  
  // Prerequisites and outcomes
  prerequisites: [{ type: String }], // ['Basic HTML/CSS', 'JavaScript fundamentals']
  learningOutcomes: [{ type: String }], // ['Build full-stack applications', 'Deploy to cloud']
  
  // Course metadata
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    default: 'Beginner' 
  },
  category: { 
    type: String, 
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'DevOps', 'AI/ML', 'Other'],
    default: 'Web Development'
  },
  
  // Media and resources
  thumbnail: { type: String }, // Image URL
  courseImage: { type: String }, // Detailed page image
  videoUrl: { type: String }, // Introduction video
  
  // Enrollment details
  maxStudents: { type: Number, default: 30 },
  currentEnrollments: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // Instructor details
  instructor: {
    name: { type: String },
    bio: { type: String },
    experience: { type: String },
    expertise: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
