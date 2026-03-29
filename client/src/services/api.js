const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  // Auth
  register: async (name, email, phone, password) => {
    console.log('🚀 API: Starting registration request', { name, email, phone, url: `${BASE_URL}/auth/register` });
    
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, password }),
      });
      
      console.log('📡 API: Response received', { 
        status: res.status, 
        statusText: res.statusText, 
        ok: res.ok 
      });
      
      let data;
      try {
        data = await res.json();
        console.log('📄 API: Response data', data);
      } catch (jsonError) {
        console.error('❌ API: Failed to parse JSON response', jsonError);
        // If JSON parsing fails, create a generic error response
        data = { message: 'Invalid server response' };
      }
      
      // Handle different response status codes
      if (res.ok) {
        // Success (200-299)
        console.log('✅ API: Registration successful', data);
        return {
          success: true,
          ...data
        };
      } else if (res.status === 503) {
        // Service Unavailable - Email service down
        console.log('⚠️ API: Email service unavailable', data);
        return {
          success: false,
          error: 'EMAIL_SERVICE_UNAVAILABLE',
          message: data.message || 'Email service is temporarily unavailable. Please try again later.',
          details: data.details
        };
      } else if (res.status >= 400 && res.status < 500) {
        // Client error (400-499)
        console.error('❌ API: Client error', { status: res.status, data });
        return {
          success: false,
          error: 'CLIENT_ERROR',
          message: data.message || 'Registration failed. Please check your information.',
          details: data.error || data.details
        };
      } else {
        // Server error (500+)
        console.error('💥 API: Server error', { status: res.status, data });
        return {
          success: false,
          error: 'SERVER_ERROR',
          message: data.message || 'Server error occurred. Please try again.',
          details: data.error || data.details
        };
      }
    } catch (error) {
      // Network error
      console.error('Network error during registration:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        details: error.message
      };
    }
  },

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  // Courses
  getCourses: async () => {
    const res = await fetch(`${BASE_URL}/courses`);
    return res.json();
  },

  getCourseById: async (id) => {
    const res = await fetch(`${BASE_URL}/courses/${id}`);
    if (!res.ok) {
      throw new Error(`Course not found`);
    }
    return res.json();
  },

  createCourse: async (courseData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });
    return res.json();
  },

  updateCourse: async (id, courseData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });
    return res.json();
  },

  deleteCourse: async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Enquiries
  submitEnquiry: async (enquiryData) => {
    const res = await fetch(`${BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryData),
    });
    return res.json();
  },

  getEnquiries: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  updateEnquiryStatus: async (id, status, adminNotes = '') => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enquiries/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, adminNotes }),
    });
    return res.json();
  },

  // Get enquiry by payment token (public)
  getEnquiryByPaymentToken: async (token) => {
    const res = await fetch(`${BASE_URL}/enquiries/payment/${token}`);
    return res.json();
  },

  // Payment enrollment (public)
  enrollViaPayment: async (paymentToken, paymentMethod, userEmail, userName) => {
    const res = await fetch(`${BASE_URL}/enrollments/payment-enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentToken, paymentMethod, userEmail, userName }),
    });
    return res.json();
  },

  // Enrollments
  enrollCourse: async (courseId, paymentMethod = 'card') => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enrollments/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, paymentMethod }),
    });
    return res.json();
  },

  getUserEnrollments: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enrollments/my-courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  checkEnrollmentStatus: async (courseId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enrollments/status/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Enrollments
  getMyEnrollments: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enrollments/my-courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  updateCourseProgress: async (enrollmentId, progress) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ progress }),
    });
    return res.json();
  },

  // Admin-only enrollment management
  getAllEnrollments: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enrollments/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch enrollments');
    }
    return res.json();
  },

  updateStudentProgress: async (enrollmentId, progressData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/admin/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(progressData),
    });
    if (!res.ok) {
      throw new Error('Failed to update progress');
    }
    return res.json();
  },

  // OTP Verification methods
  verifyRegistration: async (email, otp) => {
    const res = await fetch(`${BASE_URL}/auth/verify-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw {
        response: {
          status: res.status,
          data: errorData
        }
      };
    }
    
    return res.json();
  },

  resendVerification: async (email) => {
    const res = await fetch(`${BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw {
        response: {
          status: res.status,
          data: errorData
        }
      };
    }
    
    return res.json();
  },

  // Generic post method for axios-style usage
  post: async (endpoint, data, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw {
        response: {
          status: res.status,
          data: errorData
        }
      };
    }
    
    const result = await res.json();
    return { data: result };
  },

  // Password Reset Functions
  requestPasswordReset: async (email) => {
    const res = await fetch(`${BASE_URL}/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  verifyResetOTP: async (email, otp) => {
    const res = await fetch(`${BASE_URL}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return res.json();
  },

  resetPassword: async (resetToken, newPassword) => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword }),
    });
    return res.json();
  },

  // Admin function to reset student password
  adminResetStudentPassword: async (studentId, data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/auth/admin/reset-student-password/${studentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw { response: { data: await res.json() } };
    }
    return res.json();
  },
};

export default api;
