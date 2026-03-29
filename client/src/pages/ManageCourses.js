import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    fee: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingId) {
        const result = await api.updateCourse(editingId, formData);
        if (result._id) {
          setMessage('Course updated successfully');
          setEditingId(null);
        } else {
          setError(result.message || 'Failed to update course');
        }
      } else {
        const result = await api.createCourse(formData);
        if (result._id) {
          setMessage('Course created successfully');
        } else {
          setError(result.message || 'Failed to create course');
        }
      }
      
      setFormData({ title: '', description: '', duration: '', fee: '' });
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      setError('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title,
      description: course.description || '',
      duration: course.duration || '',
      fee: course.fee || '',
    });
    setEditingId(course._id);
    setMessage('');
    setError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.deleteCourse(id);
        setMessage('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        setError('Failed to delete course');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', duration: '', fee: '' });
    setMessage('');
    setError('');
  };

  return (
    <div className="container">
      {/* Modern Header */}
      <div className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div className="card-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', color: 'white' }}>
                📚 Course Content Management
              </h1>
              <p style={{ margin: '0', opacity: '0.9', fontSize: '16px' }}>
                Create, update, and organize academy course offerings
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="badge" style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                color: 'white', 
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                📊 Total: {courses.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Form */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-header">
          <h2 className="card-title">
            {editingId ? '✏️ Edit Course' : '➕ Add New Course'}
          </h2>
          <p className="card-description">
            {editingId ? 'Update course information' : 'Create a new course offering for students'}
          </p>
        </div>
        
        <div className="card-content">
          {message && (
            <div className="alert alert-success" style={{ marginBottom: '24px' }}>
              <span>✅</span>
              <div>{message}</div>
            </div>
          )}
          
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '24px' }}>
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Course Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter course title"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="duration">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 6 months, 12 weeks"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Course Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Provide a detailed description of the course content, learning outcomes, and key features..."
                style={{ minHeight: '100px' }}
              />
            </div>
            
            <div className="form-grid-2" style={{ alignItems: 'end' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="fee">Course Fee (₹)</label>
                <input
                  type="number"
                  id="fee"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter amount in rupees"
                />
              </div>
              
              <div className="course-management-actions" style={{ display: 'flex', gap: '12px' }}>
                {editingId && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  {editingId ? '💾 Update Course' : '➕ Create Course'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Courses Grid */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 Existing Courses</h2>
          <p className="card-description">Manage and organize your course catalog</p>
        </div>
        
        <div className="card-content">
          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>📚</div>
              <h3 style={{ color: '#667eea', marginBottom: '16px', fontSize: '24px' }}>
                No Courses Available
              </h3>
              <p style={{ color: '#6c757d', marginBottom: '32px', fontSize: '16px', lineHeight: '1.5' }}>
                Start building your course catalog by creating your first course offering.
              </p>
            </div>
          ) : (
            <div className="course-management-grid">
              {courses.map((course) => (
                <div key={course._id} className="course-card-enhanced">
                  <div className="card-content">
                    {/* Course Header */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#1f2937', lineHeight: '1.3' }}>
                        {course.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                        {course.duration && (
                          <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                            ⏱️ {course.duration}
                          </span>
                        )}
                        {course.fee && (
                          <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                            💰 ₹{Number(course.fee).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Course Description */}
                    {course.description && (
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#6b7280', 
                          lineHeight: '1.5',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {course.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Course Stats */}
                    <div style={{ 
                      marginBottom: '20px', 
                      padding: '12px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                        <div>
                          <strong>Duration:</strong> {course.duration || 'Not specified'}
                        </div>
                        <div>
                          <strong>Fee:</strong> {course.fee ? `₹${Number(course.fee).toLocaleString()}` : 'Contact us'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: '13px' }}
                        onClick={() => handleEdit(course)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-destructive"
                        style={{ fontSize: '13px' }}
                        onClick={() => handleDelete(course._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;
