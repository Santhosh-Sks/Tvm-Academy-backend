import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ViewEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      console.log('Fetching enquiries...');
      setLoading(true);
      const data = await api.getEnquiries();
      console.log('API response:', data);
      console.log('Type of data:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setEnquiries(data);
      } else if (data && Array.isArray(data.enquiries)) {
        // Handle case where data is wrapped in an object
        setEnquiries(data.enquiries);
      } else if (data && data.message) {
        // Handle error response from API
        console.error('API Error:', data.message);
        setEnquiries([]);
      } else {
        console.warn('API returned unexpected data format:', data);
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setEnquiries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, notes = '') => {
    try {
      const response = await api.updateEnquiryStatus(id, status, notes);
      
      if (status === 'approved' && response.paymentLink) {
        setMessage(`Enquiry approved! Payment link: ${response.paymentLink}`);
        // Copy payment link to clipboard
        navigator.clipboard.writeText(response.paymentLink);
      } else {
        setMessage(`Enquiry status updated to ${status}`);
      }
      
      fetchEnquiries();
      setSelectedEnquiry(null);
      setAdminNotes('');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Error updating enquiry status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleApprove = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setAdminNotes('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      new: '#ff6b6b',
      contacted: '#ffa726',
      approved: '#4caf50',
      payment_sent: '#2196f3',
      enrolled: '#8bc34a',
      closed: '#757575',
    };
    
    const icons = {
      new: '🔔',
      contacted: '📞',
      closed: '✅',
    };
    
    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: colors[status] || '#95a5a6',
        }}
      >
        {icons[status]} {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div>Loading enquiries...</div>;
  }

  // Ensure enquiries is always an array
  const enquiriesArray = Array.isArray(enquiries) ? enquiries : [];

  return (
    <div className="container">
      {/* Modern Header */}
      <div className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div className="card-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', color: 'white' }}>
                📋 Student Enquiry Management
              </h1>
              <p style={{ margin: '0', opacity: '0.9', fontSize: '16px' }}>
                Manage student enquiries and guide them through the enrollment process
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
                📊 Total: {enquiriesArray.length}
              </div>
              <div className="badge" style={{ 
                background: 'rgba(255, 107, 107, 0.9)', 
                color: 'white', 
                border: '1px solid rgba(255, 107, 107, 0.3)',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                🔔 New: {enquiriesArray.filter(enq => enq.status === 'new').length}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {message && <div className="success">{message}</div>}
      
      {enquiriesArray.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📭</div>
          <h3 style={{ color: '#667eea', marginBottom: '16px', fontSize: '24px' }}>
            No Student Enquiries Yet
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '32px', fontSize: '16px', lineHeight: '1.5' }}>
            When students submit enquiries through the website, they will appear here for you to manage and process.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/courses" className="btn btn-primary">
              View Courses
              <span>→</span>
            </a>
            <a href="/dashboard" className="btn btn-secondary">
              Back to Dashboard
              <span>📊</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Date</th>
                  <th style={{ width: '150px' }}>Student Info</th>
                  <th style={{ width: '130px' }}>Contact</th>
                  <th style={{ width: '120px' }}>Course</th>
                  <th style={{ width: '200px' }}>Message</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiriesArray.map((enquiry) => (
                  <tr key={enquiry._id}>
                    <td style={{ fontSize: '13px' }}>{formatDate(enquiry.createdAt)}</td>
                    <td>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{enquiry.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{enquiry.email}</div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{enquiry.phone || '-'}</td>
                    <td style={{ fontSize: '13px', fontWeight: '500' }}>
                      {enquiry.courseId ? enquiry.courseId.title : enquiry.course || 'General'}
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '13px', lineHeight: '1.4' }}>
                      {enquiry.message ? enquiry.message.substring(0, 100) + (enquiry.message.length > 100 ? '...' : '') : '-'}
                    </td>
                    <td>{getStatusBadge(enquiry.status)}</td>
                    <td>
                      {enquiry.status === 'new' && (enquiry.course || enquiry.courseId) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => handleApprove(enquiry)}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#4caf50',
                              color: 'white',
                              fontSize: '11px',
                              padding: '6px 12px'
                            }}
                          >
                            ✅ Approve
                          </button>
                          <select
                            value={enquiry.status}
                            onChange={(e) => updateStatus(enquiry._id, e.target.value)}
                            className="form-select"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            <option value="new">🔔 New</option>
                            <option value="contacted">📞 Contacted</option>
                            <option value="closed">❌ Closed</option>
                          </select>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div className="badge badge-secondary" style={{ fontSize: '10px' }}>
                            {enquiry.status.replace('_', ' ').toUpperCase()}
                          </div>
                          {enquiry.status !== 'enrolled' && enquiry.status !== 'closed' && (
                            <select
                              value={enquiry.status}
                              onChange={(e) => updateStatus(enquiry._id, e.target.value)}
                              className="form-select"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="approved">Approved</option>
                              <option value="payment_sent">Payment Sent</option>
                              <option value="enrolled">Enrolled</option>
                              <option value="closed">Closed</option>
                            </select>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Modern Approval Modal */}
      {selectedEnquiry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            margin: 0
          }}>
            <div className="card-content">
              <h3 style={{ marginBottom: '24px', color: '#333', fontSize: '20px', fontWeight: '600' }}>
                🎯 Approve Student Enquiry
              </h3>
              
              <div className="card" style={{ marginBottom: '24px', background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                <div className="card-content" style={{ padding: '16px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div><strong>Student:</strong> {selectedEnquiry.name}</div>
                    <div><strong>Email:</strong> {selectedEnquiry.email}</div>
                    <div><strong>Course:</strong> {selectedEnquiry.courseId?.title || selectedEnquiry.course}</div>
                    <div><strong>Fee:</strong> ₹{selectedEnquiry.courseId?.fee?.toLocaleString() || 'Contact for pricing'}</div>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Admin Notes (Optional):
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes for this approval..."
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(selectedEnquiry._id, 'approved', adminNotes)}
                  className="btn btn-primary"
                  style={{ background: '#4caf50', borderColor: '#4caf50' }}
                >
                  ✅ Approve & Generate Payment Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEnquiries;
