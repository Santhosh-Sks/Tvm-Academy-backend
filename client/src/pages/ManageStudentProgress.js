import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ManageStudentProgress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [showWeeklyUpdate, setShowWeeklyUpdate] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [batchProgress, setBatchProgress] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, searchTerm, filterCourse]);

  const fetchData = async () => {
    try {
      const [enrollmentsData, coursesData] = await Promise.all([
        api.getAllEnrollments(), // We need to create this API endpoint
        api.getCourses()
      ]);
      
      setEnrollments(enrollmentsData || []);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const filterEnrollments = () => {
    let filtered = enrollments;

    if (searchTerm) {
      filtered = filtered.filter(enrollment => 
        enrollment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCourse) {
      filtered = filtered.filter(enrollment => enrollment.courseId?._id === filterCourse);
    }

    setFilteredEnrollments(filtered);
  };

  const updateProgress = async (enrollmentId, newProgress, weekNote = '') => {
    try {
      await api.updateStudentProgress(enrollmentId, {
        progress: newProgress,
        weekNote,
        updatedBy: 'admin'
      });
      
      await fetchData(); // Refresh data
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Error updating progress:', error);
      
      // Handle specific validation errors from backend
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.validationError === 'PROGRESS_DECREASE_NOT_ALLOWED') {
          alert(`❌ Cannot decrease progress!\n\nCurrent: ${errorData.currentProgress}%\nRequested: ${errorData.requestedProgress}%\n\n${errorData.suggestion}`);
        } else if (errorData.validationError === 'PROGRESS_UNCHANGED') {
          alert(`⚠️ No change in progress!\n\nCurrent progress is already ${errorData.currentProgress}%.\n\n${errorData.suggestion}`);
        } else {
          alert(`Error: ${errorData.message || 'Failed to update progress. Please try again.'}`);
        }
      } else {
        alert('Failed to update progress. Please try again.');
      }
    }
  };

  const handleBatchProgressUpdate = async () => {
    if (selectedEnrollments.length === 0 || !batchProgress) {
      alert('Please select enrollments and enter progress value.');
      return;
    }

    const progressValue = parseInt(batchProgress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      alert('❌ Please enter a valid progress value between 0 and 100!');
      return;
    }

    // Check if any selected enrollment would have progress decreased
    const conflictingEnrollments = selectedEnrollments
      .map(id => enrollments.find(e => e._id === id))
      .filter(enrollment => {
        const currentProgress = enrollment.progress || 0;
        return progressValue <= currentProgress;
      });

    if (conflictingEnrollments.length > 0) {
      const conflictList = conflictingEnrollments
        .map(e => `• ${e.userId?.name}: Current ${e.progress || 0}%`)
        .join('\n');
      
      alert(`❌ Cannot update progress for ${conflictingEnrollments.length} student(s)!\n\nThe following students already have progress >= ${progressValue}%:\n\n${conflictList}\n\nProgress can only be increased!`);
      return;
    }

    if (!confirm(`Update progress to ${progressValue}% for ${selectedEnrollments.length} selected students?`)) {
      return;
    }

    try {
      const promises = selectedEnrollments.map(enrollmentId => 
        api.updateStudentProgress(enrollmentId, {
          progress: progressValue,
          weekNote: `Batch update to ${progressValue}% - Week ${new Date().toISOString().slice(0, 10)}`,
          updatedBy: 'admin'
        })
      );

      await Promise.all(promises);
      await fetchData();
      setSelectedEnrollments([]);
      setBatchProgress('');
      setShowWeeklyUpdate(false);
      alert(`✅ Progress updated to ${progressValue}% for ${selectedEnrollments.length} students!`);
    } catch (error) {
      console.error('Error updating batch progress:', error);
      
      // Handle specific validation errors
      if (error.response && error.response.data && error.response.data.validationError) {
        const errorData = error.response.data;
        alert(`❌ Batch update failed!\n\n${errorData.message}\n\n${errorData.suggestion}`);
      } else {
        alert('Failed to update batch progress. Some students may have been updated successfully.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEnrollmentSelect = (enrollmentId) => {
    if (selectedEnrollments.includes(enrollmentId)) {
      setSelectedEnrollments(prev => prev.filter(id => id !== enrollmentId));
    } else {
      setSelectedEnrollments(prev => [...prev, enrollmentId]);
    }
  };

  const selectAllFiltered = () => {
    const allIds = filteredEnrollments.map(e => e._id);
    setSelectedEnrollments(allIds);
  };

  const clearSelection = () => {
    setSelectedEnrollments([]);
  };

  if (loading) {
    return (
      <div className="main-section">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }}></div>
          <p>Loading student progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-section">
      <div className="section-header">
        <h1 className="section-title">Student Progress Management</h1>
        <p className="section-subtitle">
          Track and update student learning progress on a weekly basis
        </p>
      </div>

      {error && (
        <div className="alert alert-destructive" style={{ marginBottom: '24px' }}>
          <div className="alert-content">
            <span>⚠️</span>
            <div>
              <h4>Error Loading Data</h4>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by student name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Filter by Course
              </label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Weekly Progress Update
              </label>
              <button
                onClick={() => setShowWeeklyUpdate(!showWeeklyUpdate)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Weekly Update
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={selectAllFiltered} className="btn btn-secondary">
                Select All ({filteredEnrollments.length})
              </button>
              <button onClick={clearSelection} className="btn btn-secondary">
                Clear Selection
              </button>
            </div>
          </div>

          {showWeeklyUpdate && (
            <div style={{ 
              marginTop: '20px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ marginBottom: '16px', color: '#2c3e50' }}> Weekly Progress Update</h4>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Progress Percentage (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter progress percentage"
                    value={batchProgress}
                    onChange={(e) => setBatchProgress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <button
                  onClick={handleBatchProgressUpdate}
                  className="btn btn-primary"
                  disabled={selectedEnrollments.length === 0 || !batchProgress}
                  style={{ opacity: selectedEnrollments.length === 0 || !batchProgress ? 0.6 : 1 }}
                >
                  Update {selectedEnrollments.length} Student{selectedEnrollments.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Progress List */}
      <div className="card">
        <div className="card-content">
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
             Student Enrollments ({filteredEnrollments.length})
          </h3>

          {filteredEnrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h4>No Enrollments Found</h4>
              <p>No students match your current search criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                      <input
                        type="checkbox"
                        checked={selectedEnrollments.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                        onChange={() => selectedEnrollments.length === filteredEnrollments.length ? clearSelection() : selectAllFiltered()}
                      />
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Student</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Course</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Enrolled Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Progress</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Last Updated</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedEnrollments.includes(enrollment._id)}
                          onChange={() => handleEnrollmentSelect(enrollment._id)}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                            {enrollment.userId?.name || 'N/A'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            {enrollment.userId?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '500', color: '#495057' }}>
                          {enrollment.courseId?.title || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>
                        {formatDate(enrollment.createdAt)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '60px',
                            height: '8px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${enrollment.progress || 0}%`,
                              height: '100%',
                              backgroundColor: enrollment.progress === 100 ? '#4caf50' : '#2196f3',
                              borderRadius: '4px'
                            }}></div>
                          </div>
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: '600',
                            color: enrollment.progress === 100 ? '#4caf50' : '#2196f3'
                          }}>
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6c757d' }}>
                        {enrollment.progressUpdatedAt ? 
                          formatDate(enrollment.progressUpdatedAt) : 
                          'Not updated'
                        }
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => {
                            const currentProgress = enrollment.progress || 0;
                            const newProgress = prompt(
                              `📊 Update Progress for ${enrollment.userId?.name}\n\n` +
                              `Course: ${enrollment.courseId?.title}\n` +
                              `Current Progress: ${currentProgress}%\n\n` +
                              `⚠️ Note: Progress can only be INCREASED\n` +
                              `Please enter a value HIGHER than ${currentProgress}% (max: 100%):`
                            );
                            
                            if (newProgress !== null) {
                              const progressNum = parseInt(newProgress);
                              
                              // Frontend validation
                              if (isNaN(progressNum)) {
                                alert('❌ Please enter a valid number!');
                                return;
                              }
                              
                              if (progressNum < 0 || progressNum > 100) {
                                alert('❌ Progress must be between 0% and 100%!');
                                return;
                              }
                              
                              if (progressNum <= currentProgress) {
                                alert(`❌ Cannot decrease or keep same progress!\n\nCurrent: ${currentProgress}%\nEntered: ${progressNum}%\n\nPlease enter a value HIGHER than ${currentProgress}%`);
                                return;
                              }
                              
                              const weekNote = prompt('📝 Optional: Add a weekly note about the student\'s progress:') || '';
                              updateProgress(enrollment._id, progressNum, weekNote);
                            }
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          📊 Update
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
              {filteredEnrollments.length}
            </div>
            <div style={{ color: '#6c757d' }}>Total Students</div>
          </div>
        </div>

        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
              {filteredEnrollments.filter(e => e.progress === 100).length}
            </div>
            <div style={{ color: '#6c757d' }}>Completed</div>
          </div>
        </div>

        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
              {filteredEnrollments.filter(e => e.progress > 0 && e.progress < 100).length}
            </div>
            <div style={{ color: '#6c757d' }}>In Progress</div>
          </div>
        </div>

        <div className="card">
          <div className="card-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>
              {filteredEnrollments.filter(e => !e.progress || e.progress === 0).length}
            </div>
            <div style={{ color: '#6c757d' }}>Not Started</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStudentProgress;
