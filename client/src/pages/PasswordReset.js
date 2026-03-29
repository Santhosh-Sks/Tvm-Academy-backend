import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PasswordReset = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.requestPasswordReset(email);
      setSuccess(response.message);
      setStep(2);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.verifyResetOTP(email, otp);
      setResetToken(response.resetToken);
      setSuccess(response.message);
      setStep(3);
    } catch (error) {
      setError('Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await api.resetPassword(resetToken, newPassword);
      setSuccess(response.message);
      setStep(4);
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '450px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#666',
      fontSize: '16px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e1e5e9',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s',
      boxSizing: 'border-box'
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '14px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    alert: {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px'
    },
    alertError: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    alertSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '30px',
      gap: '10px'
    },
    stepDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#e1e5e9'
    },
    stepDotActive: {
      backgroundColor: '#007bff'
    },
    stepLine: {
      width: '30px',
      height: '2px',
      backgroundColor: '#e1e5e9'
    },
    link: {
      color: '#007bff',
      textDecoration: 'none',
      textAlign: 'center',
      display: 'block',
      marginTop: '20px'
    },
    successContainer: {
      textAlign: 'center'
    },
    successIcon: {
      fontSize: '48px',
      color: '#28a745',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>
            {step === 1 && 'Enter your email to reset password'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Create your new password'}
            {step === 4 && 'Password reset successful!'}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          <div style={{...styles.stepDot, ...(step >= 1 ? styles.stepDotActive : {})}}></div>
          <div style={styles.stepLine}></div>
          <div style={{...styles.stepDot, ...(step >= 2 ? styles.stepDotActive : {})}}></div>
          <div style={styles.stepLine}></div>
          <div style={{...styles.stepDot, ...(step >= 3 ? styles.stepDotActive : {})}}></div>
          <div style={styles.stepLine}></div>
          <div style={{...styles.stepDot, ...(step >= 4 ? styles.stepDotActive : {})}}></div>
        </div>

        {error && (
          <div style={{...styles.alert, ...styles.alertError}}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{...styles.alert, ...styles.alertSuccess}}>
            ✅ {success}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form style={styles.form} onSubmit={handleEmailSubmit}>
            <div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <button 
              type="submit" 
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? '🔄 Sending...' : '📧 Send Reset OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Input */}
        {step === 2 && (
          <form style={styles.form} onSubmit={handleOTPSubmit}>
            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.input}
                maxLength={6}
                required
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                OTP sent to: {email}
              </small>
            </div>
            <button 
              type="submit" 
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? '🔄 Verifying...' : '🔒 Verify OTP'}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form style={styles.form} onSubmit={handlePasswordSubmit}>
            <div>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <button 
              type="submit" 
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? '🔄 Resetting...' : '✅ Reset Password'}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>🎉</div>
            <h3 style={{ color: '#28a745', marginBottom: '20px' }}>Password Reset Successfully!</h3>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Your password has been reset. You can now login with your new password.
            </p>
            <button 
              onClick={() => navigate('/login')}
              style={styles.button}
            >
              🔑 Go to Login
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        {step !== 4 && (
          <a 
            href="/login" 
            style={styles.link}
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            ← Back to Login
          </a>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;
