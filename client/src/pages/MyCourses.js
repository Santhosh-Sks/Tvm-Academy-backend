import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await api.getMyEnrollments();
      console.log('Enrollments data:', data);
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to load your enrolled courses. Please try refreshing the page.');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const getCourseImage = (courseTitle) => {
    const title = (courseTitle || '').toLowerCase();
    
    if (title.includes('full stack') || title.includes('web development')) {
      return '💻';
    } else if (title.includes('data science') || title.includes('analytics')) {
      return '📊';
    } else if (title.includes('mobile') || title.includes('app development')) {
      return '📱';
    } else if (title.includes('digital marketing') || title.includes('marketing')) {
      return '📢';
    } else if (title.includes('ui/ux') || title.includes('design')) {
      return '🎨';
    } else if (title.includes('python')) {
      return '🐍';
    } else if (title.includes('java')) {
      return '☕';
    } else if (title.includes('cloud') || title.includes('aws') || title.includes('azure')) {
      return '☁️';
    } else if (title.includes('ai') || title.includes('artificial intelligence')) {
      return '🤖';
    } else {
      return '📖';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="main-section">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }}></div>
          <p>Loading your enrolled courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-section">
      <div className="section-header">
        <h1 className="section-title">📚 My Learning Dashboard</h1>
        <p className="section-subtitle">
          Track your learning progress and access course materials from your personalized dashboard
        </p>
      </div>
      
      {error && (
        <div className="alert alert-destructive" style={{ marginBottom: '24px' }}>
          <div className="alert-content">
            <span>⚠️</span>
            <div>
              <h4>Error Loading Courses</h4>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {enrollments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 40px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '20px',
          border: '2px dashed #e0e0e0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📚</div>
          <h3 style={{ color: '#667eea', marginBottom: '16px', fontSize: '24px' }}>
            No Enrolled Courses Yet
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '32px', fontSize: '16px', lineHeight: '1.5' }}>
            You haven't enrolled in any courses yet. Start your learning journey by exploring our 
            comprehensive course catalog and enrolling in programs that match your goals.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/courses" className="btn btn-primary">
              Browse All Courses
              <span>→</span>
            </a>
            <a href="/enquiry" className="btn btn-secondary">
              Get Course Guidance
              <span>💬</span>
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Summary */}
          <div className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div className="card-content">
              <div className="grid grid-cols-3" style={{ textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{enrollments.length}</div>
                  <div style={{ opacity: 0.9 }}>Total Courses</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                    {enrollments.filter(e => e.progress === 100).length}
                  </div>
                  <div style={{ opacity: 0.9 }}>Completed</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                    {Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)}%
                  </div>
                  <div style={{ opacity: 0.9 }}>Average Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="card" style={{ height: 'fit-content' }}>
                <div className="card-content">
                  {/* Course Header */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '40px', marginRight: '16px' }}>
                      {getCourseImage(enrollment.courseId?.title || '')}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h3 className="card-title" style={{ margin: '0 0 4px 0', fontSize: '16px', lineHeight: '1.3' }}>
                        {enrollment.courseId?.title || 'Course'}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                        📅 Enrolled: {formatDate(enrollment.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Course Details */}
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>
                        <strong>Duration:</strong> {enrollment.courseId?.duration || 'N/A'}
                      </div>
                      <div>
                        <strong>Fee Paid:</strong> ₹{enrollment.courseId?.fee?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Section */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Learning Progress (Updated by Academy)
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: enrollment.progress === 100 ? '#4caf50' : '#2196f3' }}>
                        {enrollment.progress || 0}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '10px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '5px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${enrollment.progress || 0}%`,
                        height: '100%',
                        backgroundColor: enrollment.progress === 100 ? '#4caf50' : '#2196f3',
                        transition: 'width 0.3s ease',
                        borderRadius: '5px'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                      {enrollment.progress === 100 ? '🎉 Course Completed!' : `${100 - (enrollment.progress || 0)}% remaining`}
                    </div>
                    {enrollment.progressUpdatedAt && (
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '4px', textAlign: 'center' }}>
                        📅 Last updated: {formatDate(enrollment.progressUpdatedAt)}
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: enrollment.progress === 100 ? '#e8f5e8' : '#e3f2fd',
                      color: enrollment.progress === 100 ? '#4caf50' : '#2196f3'
                    }}>
                      {enrollment.progress === 100 ? '✅ Completed' : '📚 In Progress'}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '13px' }}
                      onClick={() => {
                        // In a real app, this would open course content
                        alert('Course content access would open here. This would redirect to the learning platform.');
                      }}
                    >
                      {enrollment.progress === 100 ? 'Review Content' : 'Continue Learning'}
                    </button>
                    
                    {enrollment.progress === 100 && (
                      <button 
                        className="btn btn-secondary"
                        style={{ fontSize: '13px' }}
                        onClick={() => {
                          alert('Certificate download would start here. In a real app, this would generate and download your completion certificate.');
                        }}
                      >
                        📜 Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyCourses;
