import React, { useState } from 'react';
import api from '../services/api';
import './OTPLogin.css';

const OTPLogin = ({ onLogin, onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/send-otp', { email });
      setMaskedEmail(response.data.email);
      setMessage(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
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
      const response = await api.post('/auth/verify-otp', { 
        email, 
        otp: otpString 
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
      // Reset OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/send-otp', { email });
      setMessage('OTP resent successfully!');
      setOtp(['', '', '', '', '', '']); // Reset OTP inputs
      document.getElementById('otp-0')?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-login-container">
      <div className="otp-login-card">
        <div className="otp-header">
          <h2>🔐 Secure Login</h2>
          <p>Sign in with OTP verification</p>
        </div>

        {step === 1 ? (
          // Step 1: Email Input
          <form onSubmit={handleSendOTP} className="otp-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button type="submit" disabled={loading} className="send-otp-btn">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

            <div className="login-options">
              <button 
                type="button" 
                onClick={onBackToLogin} 
                className="back-to-login-btn"
              >
                ← Back to Password Login
              </button>
            </div>
          </form>
        ) : (
          // Step 2: OTP Verification
          <form onSubmit={handleVerifyOTP} className="otp-form">
            <div className="otp-info">
              <p>We've sent a 6-digit code to:</p>
              <strong>{maskedEmail}</strong>
            </div>

            <div className="otp-input-group">
              <label>Enter Verification Code</label>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
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

            <button type="submit" disabled={loading} className="verify-otp-btn">
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <div className="otp-actions">
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
                onClick={() => {
                  setStep(1);
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                  setMessage('');
                }} 
                className="change-email-btn"
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OTPLogin;
