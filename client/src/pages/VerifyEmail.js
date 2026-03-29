import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RegistrationVerification from '../components/RegistrationVerification';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from URL params, location state, or localStorage
    const urlParams = new URLSearchParams(location.search);
    const emailFromUrl = urlParams.get('email');
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');

    const verificationEmail = emailFromUrl || emailFromState || emailFromStorage;

    if (verificationEmail) {
      setEmail(verificationEmail);
      // Store in localStorage for persistence
      localStorage.setItem('pendingVerificationEmail', verificationEmail);
    } else {
      // No email found, redirect to registration
      navigate('/register');
    }
  }, [location, navigate]);

  const handleVerificationComplete = (user) => {
    // Verification complete, redirect based on user role
    if (user.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/courses');
    }
  };

  const handleBackToRegister = () => {
    localStorage.removeItem('pendingVerificationEmail');
    navigate('/register');
  };

  if (!email) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '20px',
          textAlign: 'center'
        }}>
          <h2>Loading...</h2>
          <p>Preparing email verification</p>
        </div>
      </div>
    );
  }

  return (
    <RegistrationVerification
      email={email}
      onVerificationComplete={handleVerificationComplete}
      onBackToRegister={handleBackToRegister}
    />
  );
};

export default VerifyEmail;
