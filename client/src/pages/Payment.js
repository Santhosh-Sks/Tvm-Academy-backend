import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Payment = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchEnquiryDetails();
  }, [token]);

  const fetchEnquiryDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getEnquiryByPaymentToken(token);
      setEnquiry(data.enquiry);
      setUserName(data.enquiry.name);
    } catch (error) {
      console.error('Error fetching enquiry details:', error);
      setError('Invalid or expired payment link. Please contact the academy for assistance.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const response = await api.enrollViaPayment(
        token,
        paymentMethod,
        enquiry.email,
        userName
      );

      if (response.message) {
        // Success - show confirmation
        alert('Payment successful! You have been enrolled in the course. Please check your email for login details.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '18px'
      }}>
        Loading payment details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '50px auto', 
        padding: '40px 20px', 
        textAlign: 'center' 
      }}>
        <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <h2 style={{ marginBottom: '16px', color: '#d63031' }}>❌ Payment Link Invalid</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{error}</p>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => navigate('/enquiry')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '12px'
              }}
            >
              Submit New Enquiry
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Enquiry not found</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
            🎓 Complete Your Enrollment
          </h1>
          <p style={{ margin: '0', opacity: '0.9', fontSize: '16px' }}>
            You're one step away from starting your learning journey!
          </p>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Course Details */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Course Details</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <p><strong>Course:</strong> {enquiry.course?.title}</p>
              <p><strong>Duration:</strong> {enquiry.course?.duration}</p>
              <p><strong>Student:</strong> {enquiry.name}</p>
              <p><strong>Email:</strong> {enquiry.email}</p>
              <div style={{ 
                marginTop: '16px', 
                padding: '16px', 
                backgroundColor: '#e7f3ff',
                borderRadius: '6px',
                border: '1px solid #b3d9ff'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>Total Amount:</span>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#667eea' 
                  }}>
                    ₹{enquiry.course?.fee?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePayment}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#333'
              }}>
                Your Name:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '500',
                color: '#333'
              }}>
                Payment Method:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { value: 'card', label: '💳 Credit/Debit Card', color: '#667eea' },
                  { value: 'upi', label: '📱 UPI Payment', color: '#52c41a' },
                  { value: 'netbanking', label: '🏦 Net Banking', color: '#1890ff' },
                  { value: 'wallet', label: '👛 Digital Wallet', color: '#fa8c16' }
                ].map((method) => (
                  <label
                    key={method.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      border: `2px solid ${paymentMethod === method.value ? method.color : '#e9ecef'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: paymentMethod === method.value ? `${method.color}10` : 'white',
                      transition: 'all 0.3s'
                    }}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {method.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#ffe6e6',
                color: '#d63031',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #fab1a0'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: processing ? '#95a5a6' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {processing ? '🔄 Processing Payment...' : '💳 Pay Now & Enroll'}
            </button>

            <p style={{ 
              textAlign: 'center', 
              marginTop: '16px', 
              fontSize: '12px', 
              color: '#6c757d' 
            }}>
              🔒 Your payment is secure and encrypted. You will receive login credentials via email after successful payment.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
