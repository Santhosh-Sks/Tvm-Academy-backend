import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './RegistrationVerification.css';

const RegistrationVerification = ({ email: propEmail, onVerificationComplete, onBackToRegister }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    // Get email from props or localStorage
    const email = propEmail || localStorage.getItem('pendingVerificationEmail');
    
    if (email) {
      setCurrentEmail(email);
      setMaskedEmail(email.replace(/(.{2}).*@/, '$1***@'));
      // Store in localStorage for persistence across page refreshes
      localStorage.setItem('pendingVerificationEmail', email);
    } else {
      // No email found, redirect to registration
      if (onBackToRegister) {
        onBackToRegister();
      }
    }
  }, [propEmail, onBackToRegister]);

  const clearVerificationState = () => {
    localStorage.removeItem('pendingVerificationEmail');
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`verify-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`verify-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-registration', { 
        email: currentEmail, 
        otp: otpString 
      });
      
      setMessage(response.data.message);
      
      // Store token and user info
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Clear verification state
      clearVerificationState();
      
      // Call completion handler after a brief delay to show success message
      setTimeout(() => {
        onVerificationComplete(response.data.user);
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email');
      
      // If user account not found, clear state and go back to registration
      if (err.response?.status === 404 && err.response?.data?.message?.includes('User account not found')) {
        clearVerificationState();
        setTimeout(() => {
          onBackToRegister();
        }, 2000);
      } else {
        // Reset OTP inputs on other errors
        setOtp(['', '', '', '', '', '']);
        document.getElementById('verify-otp-0')?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!currentEmail) {
      setError('Email not found. Please go back to registration.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Use a special resend endpoint or re-trigger registration
      const response = await api.post('/auth/resend-verification', { 
        email: currentEmail 
      });
      
      setMessage('Verification code resent successfully!');
      setOtp(['', '', '', '', '', '']); // Reset OTP inputs
      document.getElementById('verify-otp-0')?.focus();
    } catch (err) {
      // If resend endpoint doesn't exist, fallback to re-registration
      if (err.response?.status === 404) {
        try {
          // Try to re-trigger registration (this will handle existing unverified users)
          const fallbackResponse = await api.post('/auth/register', { 
            name: 'User', // This will be ignored since user already exists
            email: currentEmail, 
            password: 'temp' // This will be ignored
          });
          
          if (fallbackResponse.data.requiresVerification) {
            setMessage('Verification code resent successfully!');
            setOtp(['', '', '', '', '', '']); // Reset OTP inputs
            document.getElementById('verify-otp-0')?.focus();
          }
        } catch (fallbackErr) {
          setError('Failed to resend verification code. Please try registering again.');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to resend verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    clearVerificationState();
    if (onBackToRegister) {
      onBackToRegister();
    }
  };

  // Show error if no email is available
  if (!currentEmail && !propEmail) {
    return (
      <div className="registration-verification-container">
        <div className="verification-card">
          <div className="verification-header">
            <div className="success-icon">⚠️</div>
            <h2>Verification Session Expired</h2>
            <p>Please start the registration process again</p>
          </div>
          <button 
            onClick={handleBackToRegister}
            className="verify-btn"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <div className="success-icon">📧</div>
          <h2>Verify Your Email</h2>
          <p>We've sent a verification code to your email</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="verification-form">
          <div className="email-info">
            <p>Verification code sent to:</p>
            <strong>{maskedEmail}</strong>
          </div>

          <div className="otp-input-group">
            <label>Enter 6-digit verification code</label>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`verify-otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  className="otp-digit"
                  disabled={loading}
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" disabled={loading} className="verify-btn">
            {loading ? 'Verifying...' : 'Verify & Complete Registration'}
          </button>

          <div className="verification-actions">
            <button 
              type="button" 
              onClick={handleResendOTP} 
              disabled={loading}
              className="resend-btn"
            >
              Resend Code
            </button>
            <button 
              type="button" 
              onClick={onBackToRegister} 
              className="back-btn"
            >
              ← Back to Registration
            </button>
          </div>
        </form>
      </div>

      <div className="verification-info">
        <div className="info-card">
          <h3>🎉 Almost Done!</h3>
          <p>After verification, you'll have access to:</p>
          <ul>
            <li>📚 Comprehensive course catalog</li>
            <li>👨‍🏫 Expert instructors</li>
            <li>🏆 Professional certifications</li>
            <li>💻 Hands-on learning experiences</li>
          </ul>
        </div>
        
        <div className="help-card">
          <h4>Need Help?</h4>
          <p>• Check your spam/junk folder</p>
          <p>• Code expires in 5 minutes</p>
          <p>• Use "Resend Code" if needed</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationVerification;
