import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCourseImage = (courseTitle) => {
    const title = courseTitle.toLowerCase();
    
    if (title.includes('full stack') || title.includes('web development')) {
      return '💻';
    } else if (title.includes('data science') || title.includes('analytics')) {
      return '📊';
    } else if (title.includes('mobile') || title.includes('app development')) {
      return '📱';
    } else if (title.includes('digital marketing') || title.includes('marketing')) {
      return '📈';
    } else if (title.includes('ui/ux') || title.includes('design')) {
      return '🎨';
    } else if (title.includes('cybersecurity') || title.includes('security')) {
      return '🛡️';
    } else if (title.includes('cloud') || title.includes('devops')) {
      return '☁️';
    } else if (title.includes('ai') || title.includes('artificial intelligence') || title.includes('machine learning')) {
      return '🤖';
    } else if (title.includes('python')) {
      return '🐍';
    } else if (title.includes('java')) {
      return '☕';
    } else {
      return '📖';
    }
  };

  const handleCourseEnquiry = (course) => {
    // Store course details in session storage to pre-fill enquiry form
    sessionStorage.setItem('selectedCourse', JSON.stringify({
      title: course.title,
      fee: course.fee,
      duration: course.duration
    }));
    
    // Navigate to enquiry page
    navigate('/enquiry');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        Loading courses...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '18px',
        color: 'var(--error)',
        textAlign: 'center'
      }}>
        <div>
          <p>{error}</p>
          <button 
            onClick={fetchCourses} 
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '100px 0 32px 0' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '700', 
          color: 'var(--text-primary)', 
          marginBottom: '16px' 
        }}>
          Our Courses
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: 'var(--text-secondary)', 
          maxWidth: '600px', 
          margin: '0 auto' 
        }}>
          Explore our comprehensive range of professional courses designed to advance your career
        </p>
      </div>

      {courses.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '16px' }}>
            No courses available at the moment.
          </p>
          <p style={{ fontSize: '14px' }}>
            Please check back later or contact us for more information.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {courses.map((course) => (
            <div key={course._id} style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border)',
              transition: 'all 0.3s ease',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
              }
            }}>
              {/* Course Image Header */}
              <div style={{
                backgroundColor: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover))',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <span style={{ 
                  fontSize: '48px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}>
                  {getCourseImage(course.title)}
                </span>
              </div>
              
              {/* Course Content */}
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: 'var(--text-primary)', 
                    marginBottom: '12px',
                    lineHeight: '1.3'
                  }}>
                    {course.title}
                  </h3>
                  
                  {/* Course Duration - More Prominent */}
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--light-blue)',
                    color: 'var(--primary-blue-dark)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    ⏱️ {course.duration}
                  </div>
                  
                  <p style={{ 
                    fontSize: '15px', 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.6'
                  }}>
                    {course.description}
                  </p>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '20px' 
                }}>
                  <div>
                    <span style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: 'var(--primary-blue)' 
                    }}>
                      ₹{course.fee?.toLocaleString() || 'Contact for pricing'}
                    </span>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginTop: '2px'
                    }}>
                      Course Fee
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '20px'
                }}>
                  <button 
                    onClick={() => navigate(`/course/${course._id}`)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      color: 'var(--primary-blue)',
                      border: '2px solid var(--primary-blue)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'var(--primary-blue)';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = 'var(--primary-blue)';
                    }}
                  >
                    View Details
                  </button>

                  <button 
                    onClick={() => handleCourseEnquiry(course)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      backgroundColor: 'var(--primary-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-blue-hover)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-blue)'}
                  >
                    Enquire Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
