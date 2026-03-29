import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course) => {
    sessionStorage.setItem('selectedCourse', JSON.stringify(course));
    window.location.href = '/enquiry';
  };

  const styles = {
    heroSection: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '120px 0 80px',
      textAlign: 'center'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    heroTitle: {
      fontSize: '4rem',
      fontWeight: '700',
      marginBottom: '24px',
      letterSpacing: '-1px'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      marginBottom: '40px',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto 40px'
    },
    ctaButtons: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    btnPrimary: {
      background: '#fff',
      color: '#667eea',
      padding: '15px 30px',
      borderRadius: '50px',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '16px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'inline-block'
    },
    btnSecondary: {
      background: 'transparent',
      color: '#fff',
      padding: '15px 30px',
      borderRadius: '50px',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '16px',
      border: '2px solid rgba(255,255,255,0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'inline-block'
    },
    section: {
      padding: '80px 0'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '20px',
      color: '#2c3e50'
    },
    sectionSubtitle: {
      fontSize: '1.1rem',
      textAlign: 'center',
      color: '#6c757d',
      marginBottom: '60px',
      maxWidth: '600px',
      margin: '0 auto 60px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '40px',
      marginBottom: '60px'
    },
    statCard: {
      textAlign: 'center',
      padding: '30px 20px'
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: '700',
      color: '#667eea',
      marginBottom: '10px'
    },
    statLabel: {
      fontSize: '1rem',
      color: '#6c757d',
      fontWeight: '500'
    },
    aboutSection: {
      background: '#f8f9fa',
      padding: '80px 0'
    },
    aboutGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '50px',
      alignItems: 'center'
    },
    aboutText: {
      fontSize: '1.1rem',
      lineHeight: '1.7',
      color: '#5a6c7d',
      marginBottom: '30px'
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '30px'
    },
    featureCard: {
      background: '#fff',
      padding: '30px',
      borderRadius: '15px',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease'
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '20px'
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#2c3e50'
    },
    featureDesc: {
      color: '#6c757d',
      lineHeight: '1.6'
    },
    courseGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '30px',
      marginBottom: '50px'
    },
    courseCard: {
      background: '#fff',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease'
    },
    courseContent: {
      padding: '30px'
    },
    courseIcon: {
      fontSize: '3rem',
      marginBottom: '20px',
      display: 'block'
    },
    courseTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#2c3e50'
    },
    courseMeta: {
      color: '#6c757d',
      fontSize: '0.9rem',
      marginBottom: '20px'
    },
    ctaSection: {
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '80px 0'
    },
    ctaTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '20px'
    },
    ctaText: {
      fontSize: '1.1rem',
      marginBottom: '40px',
      opacity: 0.9
    }
  };

  return (
    <div className="page-content">
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <h1 style={styles.heroTitle}>TVM Academy</h1>
          <p style={styles.heroSubtitle}>
            Empowering careers through cutting-edge technology education and industry-focused training programs
          </p>
          <div style={styles.ctaButtons}>
            <a href="/courses" style={styles.btnPrimary}>
              Explore Courses
            </a>
            <a href="/enquiry" style={styles.btnSecondary}>
              Start Your Journey
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>500+</div>
              <div style={styles.statLabel}>Students Trained</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>15+</div>
              <div style={styles.statLabel}>Expert Courses</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>95%</div>
              <div style={styles.statLabel}>Success Rate</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>50+</div>
              <div style={styles.statLabel}>Industry Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* About TVM Academy */}
      <section style={styles.aboutSection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>About TVM Academy</h2>
          <div style={styles.aboutGrid}>
            <div>
              <p style={styles.aboutText}>
                TVM Academy stands as a premier destination for technology education, dedicated to bridging the gap 
                between academic learning and industry requirements. Founded with a vision to democratize quality 
                tech education, we have been at the forefront of training the next generation of technology professionals.
              </p>
              <p style={styles.aboutText}>
                Our comprehensive curriculum, designed by industry experts, ensures that every student receives 
                practical, hands-on experience with the latest technologies and methodologies that drive today's 
                digital transformation.
              </p>
            </div>
            <div style={styles.featureGrid}>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>🎯</div>
                <h4 style={styles.featureTitle}>Industry-Focused</h4>
                <p style={styles.featureDesc}>
                  Curriculum designed with real industry needs and current market trends
                </p>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>👨‍🏫</div>
                <h4 style={styles.featureTitle}>Expert Mentorship</h4>
                <p style={styles.featureDesc}>
                  Learn from seasoned professionals with years of industry experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Popular Courses</h2>
          <p style={styles.sectionSubtitle}>
            Discover our most sought-after programs designed to accelerate your career growth
          </p>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          ) : (
            <div style={styles.courseGrid}>
              {courses.slice(0, 3).map((course) => (
                <div key={course._id} style={styles.courseCard}>
                  <div style={styles.courseContent}>
                    <span style={styles.courseIcon}>
                      {course.title.toLowerCase().includes('full stack') ? '💻' :
                       course.title.toLowerCase().includes('data') ? '📊' :
                       course.title.toLowerCase().includes('mobile') ? '📱' :
                       course.title.toLowerCase().includes('python') ? '🐍' :
                       course.title.toLowerCase().includes('java') ? '☕' :
                       course.title.toLowerCase().includes('design') ? '🎨' : '📖'}
                    </span>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    <p style={styles.courseMeta}>
                      {course.duration} • ₹{course.fee?.toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleEnrollClick(course)}
                      style={{...styles.btnPrimary, width: '100%', background: '#667eea', color: 'white'}}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ textAlign: 'center' }}>
            <a href="/courses" style={{...styles.btnSecondary, color: '#667eea', borderColor: '#667eea'}}>
              View All Courses
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Ready to Transform Your Career?</h2>
          <p style={styles.ctaText}>
            Join thousands of successful graduates who have advanced their careers with TVM Academy
          </p>
          <div style={styles.ctaButtons}>
            <a href="/enquiry" style={{...styles.btnPrimary, background: '#fff', color: '#2c3e50'}}>
              Get Started Today
            </a>
            <a href="/courses" style={styles.btnSecondary}>
              Explore Programs
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
