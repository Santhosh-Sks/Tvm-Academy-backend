import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Enquiry = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    message: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState(null);

  useEffect(() => {
    fetchCourses();
    loadSelectedCourse();
  }, []);

  const loadSelectedCourse = () => {
    const storedCourse = sessionStorage.getItem('selectedCourse');
    if (storedCourse) {
      const courseInfo = JSON.parse(storedCourse);
      setSelectedCourseInfo(courseInfo);
      setFormData(prev => ({
        ...prev,
        course: courseInfo.title,
        message: `I'm interested in learning more about the ${courseInfo.title} course. Could you please provide more details about:

- Course curriculum and modules
- Class timings and schedule  
- Prerequisites and eligibility
- Fee structure and payment options
- Admission process and enrollment
- Job placement assistance
- Certification details

Course Details I'm interested in:
• Title: ${courseInfo.title}
• Duration: ${courseInfo.duration}
• Fee: ₹${courseInfo.fee?.toLocaleString() || 'N/A'}

Please contact me to discuss further.
Thank you!`
      }));
      // Clear the stored course data
      sessionStorage.removeItem('selectedCourse');
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await api.getCourses();
      // Ensure data is an array before setting
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        // If API returns non-array data, set empty array
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Set empty array on error
      setCourses([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const result = await api.submitEnquiry(formData);
      if (result.message) {
        setMessage({
          type: 'success',
          title: '✅ Enquiry Submitted Successfully!',
          content: 'Thank you for initiating your enrollment enquiry! Your application has been entered into our admission workflow system. Our enrollment specialists will contact you within 24 hours with comprehensive program details, fee structure, and guide you through the next steps of our streamlined enrollment process.',
          note: 'Your enquiry is now visible in our admin dashboard and will be processed shortly.'
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          course: '',
          message: '',
        });
        setSelectedCourseInfo(null);
        
        // Clear success message after 10 seconds
        setTimeout(() => {
          setMessage('');
        }, 10000);
      } else {
        setError('Failed to submit enquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      setError('Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-section">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <div className="section-header">
          <h1 className="section-title">
            {selectedCourseInfo ? `Program Enrollment Enquiry - ${selectedCourseInfo.title}` : 'Student Enrollment Enquiry'}
          </h1>
          <p className="section-subtitle">
            {selectedCourseInfo 
              ? `Initiate your enrollment workflow for ${selectedCourseInfo.title}. Our academic advisors will guide you through our structured admission process, provide comprehensive program details, and facilitate your enrollment journey.`
              : 'Begin your enrollment journey with TVM Academy. Submit your enquiry to enter our streamlined admission workflow and receive personalized guidance from our enrollment specialists.'
            }
          </p>
        </div>
        
        {selectedCourseInfo && (
          <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--light-blue)' }}>
            <div className="card-content">
              <h3 style={{ color: 'var(--primary-blue)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📚 Selected Course
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <strong>Course:</strong> {selectedCourseInfo.title}
                </div>
                <div>
                  <strong>Duration:</strong> {selectedCourseInfo.duration}
                </div>
                <div>
                  <strong>Fee:</strong> ₹{selectedCourseInfo.fee?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="card">
          <div className="card-content">
            {message && (
              <div className="alert alert-success" style={{ marginBottom: '24px', padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>✅</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'hsl(140 100% 27%)', fontSize: '18px', fontWeight: '600' }}>
                      {message.title || 'Success!'}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', lineHeight: '1.5', color: 'hsl(140 100% 27%)' }}>
                      {message.content || message}
                    </p>
                    {message.note && (
                      <p style={{ 
                        margin: '0', 
                        fontSize: '14px', 
                        color: 'hsl(140 80% 35%)', 
                        fontStyle: 'italic',
                        background: 'hsl(143 85% 98%)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid hsl(145 92% 91%)'
                      }}>
                        💡 {message.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="alert alert-destructive">
                <div className="alert-content">
                  <span>⚠️</span>
                  <div>
                    <h4>Error</h4>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="form">
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="course">Course of Interest *</label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Please select a course</option>
                    {Array.isArray(courses) && courses.map((course) => (
                      <option key={course._id} value={course.title}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-input"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  placeholder="Tell us about your background, goals, and any specific questions you have..."
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Enquiry
                    <span>📤</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Contact Information */}
        <div style={{ marginTop: '48px' }}>
          <div className="section-header">
            <h2 className="section-title" style={{ fontSize: '24px' }}>Direct Contact Channels</h2>
            <p className="section-subtitle">
              You can also connect with our enrollment team directly through these professional channels
            </p>
          </div>
          
          <div className="grid grid-cols-3">
            <div className="card">
              <div className="card-content" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📞</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Call Us</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>+91-9876543210</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📧</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Email</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>info@tvm.ac.in</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📍</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Visit Us</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>TVM Academy Campus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enquiry;
