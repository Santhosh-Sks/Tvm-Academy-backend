import React, { useState, useEffect } from 'react';
import './Reports.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [yearlyReport, setYearlyReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Date controls
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Debug function to test API connection
  const testConnection = async () => {
    try {
      const response = await fetch(`${BASE_URL}/reports/test`);
      const data = await response.json();
      console.log('API test result:', data);
      alert(`API Test: ${data.message} at ${data.timestamp}`);
    } catch (err) {
      console.error('API test failed:', err);
      alert(`API Test Failed: ${err.message}`);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    } else if (activeTab === 'monthly') {
      fetchMonthlyReport();
    } else if (activeTab === 'yearly') {
      fetchYearlyReport();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in as admin.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/reports/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in as admin.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('Dashboard data received:', data);
      setDashboardStats(data.stats);
    } catch (err) {
      let errorMessage = err.message;
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      }
      setError(errorMessage);
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/reports/monthly-enrollment?month=${selectedMonth}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMonthlyReport(data.report);
    } catch (err) {
      setError('Error fetching monthly report');
      console.error('Error fetching monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlyReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/reports/yearly-overview?year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setYearlyReport(data.report);
    } catch (err) {
      setError('Error fetching yearly report');
      console.error('Error fetching yearly report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Download functionality
  const downloadReport = async (reportType) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      let url = '';
      let filename = '';

      switch (reportType) {
        case 'dashboard':
          url = `${BASE_URL}/reports/dashboard-stats`;
          filename = `dashboard-stats-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'monthly':
          url = `${BASE_URL}/reports/monthly-enrollment?month=${selectedMonth}&year=${selectedYear}`;
          filename = `monthly-report-${selectedMonth}-${selectedYear}.json`;
          break;
        case 'yearly':
          url = `${BASE_URL}/reports/yearly-overview?year=${selectedYear}`;
          filename = `yearly-report-${selectedYear}.json`;
          break;
        default:
          throw new Error('Invalid report type');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      alert(`📊 Report downloaded successfully as ${filename}`);
    } catch (err) {
      setError(`Download failed: ${err.message}`);
      console.error('Download error:', err);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        
        <div className="header-controls">
          <button 
            onClick={testConnection}
            className="test-btn"
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            Test API
          </button>
          
          <div className="date-controls" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2023, i).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="reports-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'monthly' ? 'active' : ''}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Report
        </button>
        <button 
          className={activeTab === 'yearly' ? 'active' : ''}
          onClick={() => setActiveTab('yearly')}
        >
          Yearly Overview
        </button>
      </div>

      <div className="reports-content">
        {loading && <div className="loading">Loading...</div>}
        {error && (
          <div className="error" style={{ 
            background: '#fff2f2', 
            border: '1px solid #fecaca', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0' 
          }}>
            <h3>⚠️ Connection Error</h3>
            <p>{error}</p>
            <div className="error-help">
              <h4>To fix this issue:</h4>
              <ol>
                <li>Open a new terminal/command prompt</li>
                <li>Navigate to: <code>server</code> folder</li>
                <li>Run: <code>npm start</code> or <code>node server.js</code></li>
                <li>Wait for "Server running on port 5000" message</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <div>
            {activeTab === 'dashboard' && (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Dashboard Statistics</h2>
                  <button 
                    onClick={() => downloadReport('dashboard')}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    📊 Download Dashboard Data
                  </button>
                </div>
                
                {dashboardStats ? (
                  <div className="dashboard-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    <div className="stats-card" style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                    }}>
                      <h3 style={{ color: '#2563eb', margin: '0 0 0.5rem 0' }}>
                        {dashboardStats.currentMonth?.enrollments || 0}
                      </h3>
                      <p style={{ margin: 0, color: '#6b7280' }}>This Month Enrollments</p>
                      {dashboardStats.growth?.enrollments !== undefined && (
                        <small style={{ 
                          color: dashboardStats.growth.enrollments >= 0 ? '#10b981' : '#ef4444',
                          fontWeight: 'bold'
                        }}>
                          {dashboardStats.growth.enrollments >= 0 ? '↗' : '↘'} 
                          {Math.abs(dashboardStats.growth.enrollments)}% vs last month
                        </small>
                      )}
                    </div>
                    <div className="stats-card" style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                    }}>
                      <h3 style={{ color: '#059669', margin: '0 0 0.5rem 0' }}>
                        ₹{dashboardStats.currentMonth?.revenue?.toLocaleString() || 0}
                      </h3>
                      <p style={{ margin: 0, color: '#6b7280' }}>This Month Revenue</p>
                    </div>
                    <div className="stats-card" style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                    }}>
                      <h3 style={{ color: '#7c3aed', margin: '0 0 0.5rem 0' }}>
                        {dashboardStats.totals?.courses || 0}
                      </h3>
                      <p style={{ margin: 0, color: '#6b7280' }}>Active Courses</p>
                    </div>
                    <div className="stats-card" style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                    }}>
                      <h3 style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>
                        {dashboardStats.totals?.students || 0}
                      </h3>
                      <p style={{ margin: 0, color: '#6b7280' }}>Total Students</p>
                    </div>
                    <div className="stats-card" style={{ 
                      background: 'white', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                    }}>
                      <h3 style={{ color: '#ea580c', margin: '0 0 0.5rem 0' }}>
                        {dashboardStats.totals?.pendingEnquiries || 0}
                      </h3>
                      <p style={{ margin: 0, color: '#6b7280' }}>Pending Enquiries</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    background: '#fef3c7', 
                    border: '1px solid #f59e0b', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <h3>📊 No Dashboard Data Available</h3>
                    <p>This could mean:</p>
                    <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                      <li>No enrollment data in the database</li>
                      <li>Database connection issues</li>
                      <li>Authentication problems</li>
                    </ul>
                    <p><strong>Click "Test API" button above to check connectivity</strong></p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'monthly' && (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Monthly Report - {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                  <button 
                    onClick={() => downloadReport('monthly')}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    📊 Download Monthly Report
                  </button>
                </div>
                
                {monthlyReport ? (
                  <div className="monthly-report" style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                  }}>
                    <h3>{monthlyReport.period?.monthName} {monthlyReport.period?.year} Report</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '6px' }}>
                        <strong>Total Enrollments:</strong> {monthlyReport.summary?.totalEnrollments || 0}
                      </div>
                      <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '6px' }}>
                        <strong>Total Revenue:</strong> ₹{monthlyReport.summary?.totalRevenue?.toLocaleString() || 0}
                      </div>
                      <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '6px' }}>
                        <strong>Unique Students:</strong> {monthlyReport.summary?.uniqueStudents || 0}
                      </div>
                      <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '6px' }}>
                        <strong>Avg Revenue/Enrollment:</strong> ₹{Math.round(monthlyReport.summary?.averageRevenuePerEnrollment || 0)}
                      </div>
                    </div>
                    
                    {monthlyReport.courseStats && monthlyReport.courseStats.length > 0 && (
                      <div style={{ marginTop: '2rem' }}>
                        <h4>Course-wise Performance</h4>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                              <tr style={{ background: '#f9fafb' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Course Name</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Enrollments</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {monthlyReport.courseStats.map((course, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '0.75rem' }}>{course.courseName}</td>
                                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{course.enrollmentCount}</td>
                                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹{course.totalRevenue?.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    background: '#fef3c7', 
                    border: '1px solid #f59e0b', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <h3>📅 No Monthly Data Available</h3>
                    <p>No enrollment data found for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'yearly' && (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Yearly Overview - {selectedYear}</h2>
                  <button 
                    onClick={() => downloadReport('yearly')}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    📊 Download Yearly Report
                  </button>
                </div>
                
                {yearlyReport ? (
                  <div className="yearly-report" style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                  }}>
                    <h3>{yearlyReport.year} Yearly Overview</h3>
                    <p style={{ color: '#059669', fontWeight: 'bold' }}>✅ Yearly data loaded successfully!</p>
                    
                    {yearlyReport.monthlyStats && yearlyReport.monthlyStats.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4>Monthly Performance Summary</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
                          {Array.from({ length: 12 }, (_, i) => {
                            const monthData = yearlyReport.monthlyStats.find(m => m._id?.month === i + 1);
                            const monthName = new Date(selectedYear, i).toLocaleDateString('en-US', { month: 'short' });
                            
                            return (
                              <div key={i} style={{ 
                                background: monthData ? '#f0f9ff' : '#f9fafb', 
                                padding: '0.75rem', 
                                borderRadius: '6px',
                                border: monthData ? '1px solid #0ea5e9' : '1px solid #e5e7eb'
                              }}>
                                <strong>{monthName}</strong>
                                <br />
                                <small>{monthData?.enrollments || 0} enrollments</small>
                                <br />
                                <small>₹{monthData?.revenue?.toLocaleString() || 0}</small>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    background: '#fef3c7', 
                    border: '1px solid #f59e0b', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <h3>📆 No Yearly Data Available</h3>
                    <p>No enrollment data found for {selectedYear}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
