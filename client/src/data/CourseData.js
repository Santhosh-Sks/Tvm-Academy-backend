// Course Data - Easy to manage and update course information
// This file contains all course details in a structured format

export const courseCategories = [
  'Full Stack Development',
  'Data Science',
  'Mobile Development',
  'Digital Marketing',
  'Design',
  'Cybersecurity',
  'Cloud Computing',
  'AI & Machine Learning'
];

export const courseLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

// Empty course data - courses will be loaded from MongoDB
export const courseData = [];

// Helper function for backwards compatibility with Home page
export const getFeaturedCourses = () => {
  // Return empty array since courses are loaded from API
  return [];
};

// Default export for backward compatibility
export default courseData;
