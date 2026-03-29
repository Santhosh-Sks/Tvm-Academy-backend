import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import OTPLogin from '../components/OTPLogin';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(formData.email, formData.password);
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
        
        // Redirect based on user role
        if (result.user.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/courses');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = (user) => {
    setUser(user);
    // Redirect based on user role
    if (user.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/courses');
    }
  };

  // Show OTP Login component if selected
  if (showOTPLogin) {
    return (
      <OTPLogin 
        onLogin={handleOTPLogin} 
        onBackToLogin={() => setShowOTPLogin(false)}
      />
    );
  }

  return (
    <div className="main-section">
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="section-header">
          <h1 className="section-title">Academy Portal Access</h1>
          <p className="section-subtitle">
            Access your learning dashboard and enrollment management system
          </p>
        </div>
        
        <div className="card">
          <div className="card-content">
            {error && (
              <div className="alert alert-destructive" style={{ marginBottom: '24px' }}>
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
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    Login with Password
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* OTP Login Option */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '15px'
              }}>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e1e5e9' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>OR</span>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e1e5e9' }} />
              </div>
              
              <button 
                type="button"
                onClick={() => setShowOTPLogin(true)}
                style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🔐 Login with OTP (Secure)
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a 
                href="/password-reset" 
                style={{ 
                  color: '#dc3545', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/password-reset');
                }}
              >
                🔒 Forgot Password? Reset Here
              </a>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <a href="/register" style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
