import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CourseDetails.css';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);

  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getCourseById(id);
      setCourse(response);
    } catch (err) {
      setError('Failed to load course details');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    
    if (!enquiryForm.name || !enquiryForm.email) {
      alert('Please fill in your name and email');
      return;
    }

    setEnquiryLoading(true);
    try {
      const enquiryData = {
        ...enquiryForm,
        course: course.title
      };
      
      await api.submitEnquiry(enquiryData);
      setEnquiryMessage('Enquiry submitted successfully! We will contact you soon.');
      setEnquiryForm({ name: '', email: '', phone: '', message: '' });
      setShowEnquiryForm(false);
      
      // Show success message and redirect after delay
      setTimeout(() => {
        navigate('/courses');
      }, 3000);
      
    } catch (err) {
      console.error('Enquiry submission error:', err);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEnquiryForm({
      ...enquiryForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="course-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/courses')} className="btn btn-primary">
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-details-error">
        <h2>Course Not Found</h2>
        <p>The requested course could not be found.</p>
        <button onClick={() => navigate('/courses')} className="btn btn-primary">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="course-details-container">
      {/* Hero Section */}
      <div className="course-hero">
        <div className="course-hero-content">
          <div className="course-hero-text">
            <h1 className="course-title">{course.title}</h1>
            <p className="course-short-description">
              {course.shortDescription || course.description}
            </p>
            <div className="course-meta">
              <span className="course-level">{course.level}</span>
              <span className="course-category">{course.category}</span>
              <span className="course-duration">{course.duration}</span>
            </div>
            <div className="course-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => setShowEnquiryForm(true)}
              >
                Enquire Now
              </button>
              <div className="course-fee">
                <span className="fee-label">Course Fee:</span>
                <span className="fee-amount">₹{course.fee?.toLocaleString() || 'Contact for pricing'}</span>
              </div>
            </div>
          </div>
          {course.courseImage && (
            <div className="course-hero-image">
              <img src={course.courseImage} alt={course.title} />
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {enquiryMessage && (
        <div className="enquiry-success-message">
          <div className="success-content">
            <i className="fas fa-check-circle"></i>
            <p>{enquiryMessage}</p>
          </div>
        </div>
      )}

      {/* Course Content */}
      <div className="course-content">
        <div className="course-content-grid">
          {/* Main Content */}
          <div className="course-main-content">
            {/* Description */}
            <section className="course-section">
              <h2>Course Overview</h2>
              <p className="course-full-description">
                {course.fullDescription || course.description}
              </p>
            </section>

            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <section className="course-section">
                <h2>What You'll Learn</h2>
                <ul className="learning-outcomes">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index}>
                      <i className="fas fa-check"></i>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <section className="course-section">
                <h2>Course Syllabus</h2>
                <div className="syllabus-modules">
                  {course.syllabus.map((module, index) => (
                    <div key={index} className="syllabus-module">
                      <h3>{module.module}</h3>
                      {module.duration && <span className="module-duration">{module.duration}</span>}
                      {module.topics && module.topics.length > 0 && (
                        <ul className="module-topics">
                          {module.topics.map((topic, topicIndex) => (
                            <li key={topicIndex}>{topic}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <section className="course-section">
                <h2>Prerequisites</h2>
                <ul className="prerequisites">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index}>
                      <i className="fas fa-arrow-right"></i>
                      {prereq}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Course Features */}
            <section className="course-section">
              <h2>Course Features</h2>
              <div className="course-features">
                <div className="feature-grid">
                  <div className="feature-item">
                    <i className="fas fa-chalkboard-teacher"></i>
                    <div className="feature-content">
                      <h4>In-Person Classes</h4>
                      <p>Face-to-face learning with direct instructor interaction</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-code"></i>
                    <div className="feature-content">
                      <h4>Hands-on Projects</h4>
                      <p>Real-world projects completed in our labs</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-users"></i>
                    <div className="feature-content">
                      <h4>Small Class Size</h4>
                      <p>Limited students for personalized attention</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-certificate"></i>
                    <div className="feature-content">
                      <h4>Certificate of Completion</h4>
                      <p>Industry-recognized certificate upon completion</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-laptop"></i>
                    <div className="feature-content">
                      <h4>Equipped Computer Lab</h4>
                      <p>Modern computers and software for practical learning</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-graduation-cap"></i>
                    <div className="feature-content">
                      <h4>Placement Assistance</h4>
                      <p>Job placement support and career guidance</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Instructor Information */}
            {course.instructor && (
              <section className="course-section">
                <h2>Meet Your Instructor</h2>
                <div className="instructor-profile">
                  <div className="instructor-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="instructor-details">
                    <h3>{course.instructor.name || 'Expert Instructor'}</h3>
                    <p className="instructor-title">{course.instructor.title || 'Senior Developer & Technical Lead'}</p>
                    <p className="instructor-bio">
                      {course.instructor.bio || `Our experienced instructor brings years of industry expertise and has worked with leading technology companies. They are passionate about teaching and helping students achieve their career goals.`}
                    </p>
                    <div className="instructor-stats">
                      <div className="stat">
                        <i className="fas fa-graduation-cap"></i>
                        <span>{course.instructor.students || '500+'} Students Taught</span>
                      </div>
                      <div className="stat">
                        <i className="fas fa-star"></i>
                        <span>{course.instructor.rating || '4.8'} Instructor Rating</span>
                      </div>
                      <div className="stat">
                        <i className="fas fa-award"></i>
                        <span>{course.instructor.experience || '3'} Years Experience</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Target Audience */}
            <section className="course-section">
              <h2>Who This Course Is For</h2>
              <div className="target-audience">
                <div className="audience-item">
                  <i className="fas fa-user-graduate"></i>
                  <h4>Beginners</h4>
                  <p>Perfect for those starting their journey in {course.category || 'technology'}</p>
                </div>
                <div className="audience-item">
                  <i className="fas fa-laptop-code"></i>
                  <h4>Aspiring Developers</h4>
                  <p>Ideal for those looking to build professional development skills</p>
                </div>
                <div className="audience-item">
                  <i className="fas fa-chart-line"></i>
                  <h4>Career Switchers</h4>
                  <p>Great for professionals transitioning into tech careers</p>
                </div>
                <div className="audience-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <h4>Local Students</h4>
                  <p>Students who prefer offline classroom learning</p>
                </div>
              </div>
            </section>

            {/* Course Benefits */}
            <section className="course-section">
              <h2>Course Benefits</h2>
              <div className="course-benefits">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <div className="benefit-content">
                    <h4>Fast-Track Your Career</h4>
                    <p>Gain industry-relevant skills that employers are looking for</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-tools"></i>
                  </div>
                  <div className="benefit-content">
                    <h4>Practical Skills</h4>
                    <p>Learn by doing with hands-on projects in our computer lab</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-users-cog"></i>
                  </div>
                  <div className="benefit-content">
                    <h4>Peer Learning</h4>
                    <p>Collaborate with classmates and build professional networks</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="benefit-content">
                    <h4>Job Market Ready</h4>
                    <p>Complete the course with skills that match current job requirements</p>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="course-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-list">
                <div className="faq-item">
                  <div className="faq-question">
                    <i className="fas fa-question-circle"></i>
                    <span>Are classes conducted online or offline?</span>
                  </div>
                  <div className="faq-answer">
                    <p>All classes are conducted offline in our physical classroom with modern computer lab facilities.</p>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    <i className="fas fa-question-circle"></i>
                    <span>Can I get a refund if I'm not satisfied?</span>
                  </div>
                  <div className="faq-answer">
                    <p>Yes, we offer a 30-day money-back guarantee if you're not completely satisfied.</p>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    <i className="fas fa-question-circle"></i>
                    <span>Is this course suitable for beginners?</span>
                  </div>
                  <div className="faq-answer">
                    <p>Absolutely! This course is designed to take you from beginner to advanced level.</p>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    <i className="fas fa-question-circle"></i>
                    <span>Will I receive a certificate upon completion?</span>
                  </div>
                  <div className="faq-answer">
                    <p>Yes, you'll receive a certificate of completion that you can add to your LinkedIn profile.</p>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    <i className="fas fa-question-circle"></i>
                    <span>What are the class timings?</span>
                  </div>
                  <div className="faq-answer">
                    <p>We offer flexible batch timings including morning, evening, and weekend classes to suit your schedule.</p>
                  </div>
                </div>
                <div className="faq-item">
                  <div className="faq-question">
                    <i className="fas fa-question-circle"></i>
                    <span>Do you provide study materials?</span>
                  </div>
                  <div className="faq-answer">
                    <p>Yes, we provide comprehensive study materials, practice exercises, and project resources.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            {/* Technical Details */}
            <div className="sidebar-card">
              <h3>Technical Details</h3>
              
              {course.programmingLanguages && course.programmingLanguages.length > 0 && (
                <div className="tech-section">
                  <h4>Programming Languages</h4>
                  <div className="tech-tags">
                    {course.programmingLanguages.map((lang, index) => (
                      <span key={index} className="tech-tag programming-lang">{lang}</span>
                    ))}
                  </div>
                </div>
              )}

              {course.technologies && course.technologies.length > 0 && (
                <div className="tech-section">
                  <h4>Technologies</h4>
                  <div className="tech-tags">
                    {course.technologies.map((tech, index) => (
                      <span key={index} className="tech-tag technology">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {course.tools && course.tools.length > 0 && (
                <div className="tech-section">
                  <h4>Tools & Software</h4>
                  <div className="tech-tags">
                    {course.tools.map((tool, index) => (
                      <span key={index} className="tech-tag tool">{tool}</span>
                    ))}
                  </div>
                </div>
              )}

              {course.frameworks && course.frameworks.length > 0 && (
                <div className="tech-section">
                  <h4>Frameworks</h4>
                  <div className="tech-tags">
                    {course.frameworks.map((framework, index) => (
                      <span key={index} className="tech-tag framework">{framework}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Instructor */}
            {course.instructor && course.instructor.name && (
              <div className="sidebar-card">
                <h3>Instructor</h3>
                <div className="instructor-info">
                  <h4>{course.instructor.name}</h4>
                  {course.instructor.experience && (
                    <p className="instructor-experience">{course.instructor.experience}</p>
                  )}
                  {course.instructor.bio && (
                    <p className="instructor-bio">{course.instructor.bio}</p>
                  )}
                  {course.instructor.expertise && course.instructor.expertise.length > 0 && (
                    <div className="instructor-expertise">
                      <h5>Expertise:</h5>
                      <div className="expertise-tags">
                        {course.instructor.expertise.map((skill, index) => (
                          <span key={index} className="expertise-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Course Stats */}
            <div className="sidebar-card">
              <h3>Course Information</h3>
              <div className="course-stats">
                <div className="stat-item">
                  <span className="stat-label">Level:</span>
                  <span className="stat-value">{course.level}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duration:</span>
                  <span className="stat-value">{course.duration}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Category:</span>
                  <span className="stat-value">{course.category}</span>
                </div>
                {course.maxStudents && (
                  <div className="stat-item">
                    <span className="stat-label">Max Students:</span>
                    <span className="stat-value">{course.maxStudents}</span>
                  </div>
                )}
                {course.currentEnrollments !== undefined && (
                  <div className="stat-item">
                    <span className="stat-label">Currently Enrolled:</span>
                    <span className="stat-value">{course.currentEnrollments}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Enquiry Button */}
            <div className="sidebar-card sticky-enquiry">
              <button 
                className="btn btn-primary btn-block"
                onClick={() => setShowEnquiryForm(true)}
              >
                <i className="fas fa-paper-plane"></i>
                Enquire About This Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiryForm && (
        <div className="enquiry-modal-overlay" onClick={() => setShowEnquiryForm(false)}>
          <div className="enquiry-modal" onClick={(e) => e.stopPropagation()}>
            <div className="enquiry-modal-header">
              <h3>Enquire About: {course.title}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEnquiryForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleEnquirySubmit} className="enquiry-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={enquiryForm.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={enquiryForm.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={enquiryForm.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={enquiryForm.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any specific questions or requirements?"
                ></textarea>
              </div>

              <div className="enquiry-form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEnquiryForm(false)}
                  disabled={enquiryLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={enquiryLoading}
                >
                  {enquiryLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Submit Enquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
