import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NavBar = ({ user, logout }) => {
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <h2>TVM Academy</h2>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/courses" className="nav-item">Courses</Link>
          {!user && <Link to="/enquiry" className="nav-item">Enquiry</Link>}
          {user ? (
            <>
              {user.role === 'admin' && (
                <div className="admin-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                  <button 
                    className="nav-item admin-menu-btn"
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    style={{ 
                      background: 'linear-gradient(135deg, #4285f4 0%, #1e40af 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🏢 Admin Panel
                    <span style={{ transform: showAdminDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                      ▾
                    </span>
                  </button>
                  
                  {showAdminDropdown && (
                    <div className="admin-dropdown-menu" style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      minWidth: '220px',
                      zIndex: 1000,
                      marginTop: '8px'
                    }}>
                      <Link 
                        to="/dashboard" 
                        className="dropdown-item"
                        onClick={() => setShowAdminDropdown(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '14px',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                      >
                        📊 Operations Center
                      </Link>
                      <Link 
                        to="/manage-courses" 
                        className="dropdown-item"
                        onClick={() => setShowAdminDropdown(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '14px',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                      >
                        📚 Course Management
                      </Link>
                      <Link 
                        to="/view-enquiries" 
                        className="dropdown-item"
                        onClick={() => setShowAdminDropdown(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '14px',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                      >
                        📧 Enquiry Workflow
                      </Link>
                      <Link 
                        to="/manage-progress" 
                        className="dropdown-item"
                        onClick={() => setShowAdminDropdown(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '14px',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                      >
                        📊 Student Progress
                      </Link>
                      <Link 
                        to="/reports" 
                        className="dropdown-item"
                        onClick={() => setShowAdminDropdown(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: '#374151',
                          fontSize: '14px'
                        }}
                      >
                        📈 Reports & Analytics
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {user.role === 'user' && (
                <Link to="/my-courses" className="nav-item">My Courses</Link>
              )}
              <span className="user-info">Welcome, {user.name}</span>
              <button className="btn btn-outline" onClick={logout} style={{ marginLeft: '8px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/register" className="nav-item btn btn-primary" style={{ marginLeft: '8px', padding: '8px 16px' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
