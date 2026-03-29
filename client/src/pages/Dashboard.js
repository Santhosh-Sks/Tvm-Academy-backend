import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    contactedEnquiries: 0,
    approvedEnquiries: 0,
    paymentSentEnquiries: 0,
    enrolledStudents: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch courses and enquiries to calculate stats
      const [coursesData, enquiriesData] = await Promise.all([
        api.getCourses(),
        api.getEnquiries(),
      ]);

      const newEnquiries = enquiriesData.filter(enq => enq.status === 'new').length;
      const contactedEnquiries = enquiriesData.filter(enq => enq.status === 'contacted').length;
      const approvedEnquiries = enquiriesData.filter(enq => enq.status === 'approved').length;
      const paymentSentEnquiries = enquiriesData.filter(enq => enq.status === 'payment_sent').length;
      const enrolledStudents = enquiriesData.filter(enq => enq.status === 'enrolled').length;

      setStats({
        totalCourses: coursesData.length,
        totalEnquiries: enquiriesData.length,
        newEnquiries,
        contactedEnquiries,
        approvedEnquiries,
        paymentSentEnquiries,
        enrolledStudents,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <div className="hero-section">
        <h1>🏢 Academy Operations Center</h1>
        <p>Monitor enquiry workflow, track enrollment pipeline, and manage academy operations. View real-time status of the student acquisition process.</p>
      </div>
      
      {/* Workflow Overview Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', color: '#333' }}>📋 Enquiry Workflow Pipeline</h2>
        <div className="stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div className="stat-card" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ff6b6b' }}>
            <h4 style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>🔔 New Enquiries</h4>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
              {stats.newEnquiries}
            </div>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>Awaiting review</p>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: '#fff8e1', borderLeft: '4px solid #ffa726' }}>
            <h4 style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>📞 Contacted</h4>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffa726' }}>
              {stats.contactedEnquiries}
            </div>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>In communication</p>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: '#e8f5e8', borderLeft: '4px solid #4caf50' }}>
            <h4 style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>✅ Approved</h4>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
              {stats.approvedEnquiries}
            </div>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>Ready for payment</p>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
            <h4 style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>💳 Payment Sent</h4>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
              {stats.paymentSentEnquiries}
            </div>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>Awaiting payment</p>
          </div>
          
          <div className="stat-card" style={{ backgroundColor: '#f1f8e9', borderLeft: '4px solid #8bc34a' }}>
            <h4 style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0' }}>🎓 Enrolled</h4>
            <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#8bc34a' }}>
              {stats.enrolledStudents}
            </div>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>Active students</p>
          </div>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', color: '#333' }}>📈 Academy Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>📚 Total Courses</h3>
            <div className="stat-value primary">{stats.totalCourses}</div>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>Available offerings</p>
          </div>
        
          <div className="stat-card">
            <h3>📝 Total Enquiries</h3>
            <div className="stat-value success">{stats.totalEnquiries}</div>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>All time enquiries</p>
          </div>
          
          <div className="stat-card">
            <h3>🎯 Conversion Rate</h3>
            <div className="stat-value info">
              {stats.totalEnquiries > 0 ? Math.round((stats.enrolledStudents / stats.totalEnquiries) * 100) : 0}%
            </div>
            <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>Enquiry to enrollment</p>
          </div>
        </div>
      </div>      <div style={{ 
        marginTop: '50px',
        padding: '40px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '30px' }}>🚀 Quick Actions</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📚</div>
            <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>Course Management</h4>
            <p style={{ color: '#6c757d', marginBottom: '20px', fontSize: '14px' }}>
              Add, edit, or remove courses from your catalog
            </p>
            <a href="/manage-courses" className="btn">
              Manage Courses
            </a>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📧</div>
            <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>Enquiry Management</h4>
            <p style={{ color: '#6c757d', marginBottom: '20px', fontSize: '14px' }}>
              View and respond to student enquiries
            </p>
            <a href="/view-enquiries" className="btn">
              View Enquiries
            </a>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
            <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>Student Progress</h4>
            <p style={{ color: '#6c757d', marginBottom: '20px', fontSize: '14px' }}>
              Track and update student learning progress weekly
            </p>
            <a href="/manage-progress" className="btn">
              Manage Progress
            </a>
          </div>
        </div>
      </div>
      
      {stats.newEnquiries > 0 && (
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 71, 87, 0.1) 100%)',
          borderRadius: '15px',
          borderLeft: '4px solid #ff6b6b'
        }}>
          <h4 style={{ color: '#ff6b6b', margin: '0 0 10px 0' }}>🔔 Attention Required!</h4>
          <p style={{ margin: '0', color: '#495057' }}>
            You have <strong>{stats.newEnquiries}</strong> new enquir{stats.newEnquiries === 1 ? 'y' : 'ies'} waiting for your response.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
