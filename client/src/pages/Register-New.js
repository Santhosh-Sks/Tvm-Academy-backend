import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import RegistrationVerification from '../components/RegistrationVerification';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await api.register(formData.name, formData.email, formData.phone, formData.password);
      console.log('Registration result:', result);
      
      if (result.success) {
        // Registration successful
        if (result.requiresVerification) {
          // Email verification required
          setRegistrationEmail(formData.email);
          setShowVerification(true);
          setMessage('');
          localStorage.setItem('pendingVerificationEmail', formData.email);
        } else {
          // Registration successful without verification (email service down)
          setMessage(`🎉 Registration successful! ${result.message || 'Welcome to TVM Academy!'}\n\n✅ You can now login to access all our courses.`);
          setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          });
          // Redirect to login after showing success message
          setTimeout(() => {
            navigate('/login');
          }, 4000);
        }
      } else {
        // Registration failed - handle different error types
        let errorMessage = result.message || 'Registration failed. Please try again.';
        
        if (result.error === 'EMAIL_SERVICE_UNAVAILABLE') {
          errorMessage = `${result.message}\n\n💡 Don't worry! You can still try registering - our system will create your account automatically if email service is temporarily down.`;
        } else if (result.error === 'CLIENT_ERROR') {
          errorMessage = `${result.message}\n\n🔍 Please check your information and try again.`;
        } else if (result.error === 'SERVER_ERROR') {
          errorMessage = `${result.message}\n\n⚠️ This is a temporary issue. Please try again in a few moments.`;
        } else if (result.error === 'NETWORK_ERROR') {
          errorMessage = `${result.message}\n\n🌐 Please check your internet connection and try again.`;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = (user) => {
    // Registration and verification complete
    setMessage('🎉 Email verified! Welcome to TVM Academy!');
    
    // Redirect based on user role
    setTimeout(() => {
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/courses');
      }
    }, 1500);
  };

  const handleBackToRegister = () => {
    setShowVerification(false);
    setRegistrationEmail('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
    setError('');
    setMessage('');
  };

  // Show verification component if needed
  if (showVerification) {
    return (
      <RegistrationVerification
        email={registrationEmail}
        onVerificationComplete={handleVerificationComplete}
        onBackToRegister={handleBackToRegister}
      />
    );
  }

  return (
    <div className="main-section">
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="section-header">
          <h1 className="section-title">Join TVM Academy</h1>
          <p className="section-subtitle">
            Create your account to access our professional learning platform and streamlined enrollment system
          </p>
        </div>
        
        <div className="card">
          <div className="card-content">
            {message && (
              <div className="alert alert-info" style={{ marginBottom: '24px' }}>
                <div className="alert-content">
                  <span>✅</span>
                  <div>
                    <h4>Success!</h4>
                    <p>{message}</p>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="alert alert-destructive" style={{ marginBottom: '24px' }}>
                <div className="alert-content">
                  <span>⚠️</span>
                  <div>
                    <h4>Registration Issue</h4>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="form">
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
                <label className="form-label" htmlFor="email">Email Address *</label>
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
                <small style={{ color: '#666', fontSize: '12px' }}>
                  📧 You'll receive a verification email to complete registration
                </small>
              </div>

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
                <small style={{ color: '#666', fontSize: '12px' }}>
                  📱 Used for account security and course updates
                </small>
              </div>
              
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Create password"
                    required
                    minLength={6}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Minimum 6 characters
                  </small>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>
                  Login here
                </a>
              </p>
            </div>

            <div style={{ 
              background: '#f8f9ff', 
              border: '1px solid #e1e8ff', 
              borderRadius: '8px', 
              padding: '15px', 
              marginTop: '20px' 
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>
                🔐 Registration Process:
              </h4>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '12px' }}>
                <li>Fill out the registration form above</li>
                <li>Submit your information securely</li>
                <li>
                  <strong>Email verification:</strong>
                  <ul style={{ marginTop: '5px', color: '#888' }}>
                    <li>✅ If email service is working: Check your email for verification code</li>
                    <li>⚡ If email service is down: Account created automatically</li>
                  </ul>
                </li>
                <li>Start exploring courses immediately!</li>
              </ol>
              
              <div style={{ 
                marginTop: '12px', 
                padding: '8px 12px', 
                background: '#e8f5e8', 
                borderLeft: '3px solid #28a745', 
                borderRadius: '4px',
                fontSize: '11px',
                color: '#155724'
              }}>
                <strong>💚 Don't worry about email issues!</strong> Our system ensures you can always create an account and start learning.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
