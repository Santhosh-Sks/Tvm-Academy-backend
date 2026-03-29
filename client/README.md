# TVM Academy Frontend - React Application

🎓 **Modern Educational Management System Frontend**

A comprehensive React.js frontend application for TVM Academy's education management system, providing intuitive interfaces for students, administrators, and course management.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Santhosh-Sks/Tvm-Academy-frontend.git
cd Tvm-Academy-frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 📋 Table of Contents

- [Features Overview](#features-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
- [API Integration](#api-integration)
- [Component Documentation](#component-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Features Overview

### Student Portal
- **Course Discovery**: Browse comprehensive course catalog
- **Secure Registration**: Multi-step registration with email verification
- **OTP Authentication**: Secure login system with OTP verification
- **Personal Dashboard**: Track enrollments and course progress
- **Payment Integration**: Secure enrollment with payment processing

### Admin Dashboard
- **Course Management**: Full CRUD operations for course administration
- **Student Analytics**: Comprehensive reporting and analytics
- **Enquiry Management**: Handle student inquiries efficiently
- **Real-time Reports**: Dashboard statistics with download functionality

### Technical Features
- **Responsive Design**: Mobile-first approach for all devices
- **Modern UI/UX**: Clean, intuitive React interface
- **Error Boundaries**: Comprehensive error handling
- **Performance Optimized**: Lazy loading and code splitting
- **Security First**: JWT authentication and input validation

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18.2.0 |
| **Routing** | React Router DOM v6.8.1 |
| **Build Tool** | Create React App |
| **Styling** | CSS3 with Flexbox/Grid |
| **State Management** | React Hooks (useState, useEffect) |
| **API Communication** | Fetch API with custom service layer |
| **Authentication** | JWT with localStorage |
| **Form Handling** | Controlled components |

## 📂 Project Structure

```
src/
├── components/              # Reusable UI Components
│   ├── NavBar.js           # Navigation component with auth state
│   ├── CourseDetails.js    # Course information display
│   ├── ErrorBoundary.js    # Error handling wrapper
│   ├── OTPLogin.js         # OTP authentication flow
│   └── RegistrationVerification.js # Email verification
├── pages/                  # Main Application Pages
│   ├── Home.js             # Landing page with academy info
│   ├── Login.js            # User authentication portal
│   ├── Register.js         # User registration flow
│   ├── Dashboard.js        # User/Admin dashboard
│   ├── Courses.js          # Course listing and details
│   ├── MyCourses.js        # User enrolled courses
│   ├── Payment.js          # Payment processing interface
│   ├── Reports.js          # Admin analytics and reports
│   ├── ManageCourses.js    # Admin course management
│   ├── ViewEnquiries.js    # Admin enquiry management
│   └── Enquiry.js          # Public enquiry submission
├── services/               # External Service Integration
│   └── api.js              # Backend API communication
├── data/                   # Static Data and Configuration
│   └── CourseData.js       # Course information and metadata
├── styles/                 # Styling Files
│   ├── App.css             # Global application styles
│   ├── Components.css      # Component-specific styles
│   └── Pages.css           # Page-specific styles
├── App.js                  # Main application component
└── index.js                # Application entry point
```

## 🔧 Installation Guide

### Prerequisites
- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: Latest version

### Step-by-Step Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/Santhosh-Sks/Tvm-Academy-frontend.git
   cd Tvm-Academy-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_ENVIRONMENT=development
   REACT_APP_VERSION=1.0.0
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   Application opens at `http://localhost:3000`

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🔗 API Integration

### Backend Connection
The frontend communicates with the TVM Academy backend API running on `http://localhost:5000`

### Key API Endpoints

| Endpoint | Method | Purpose | Authentication |
|----------|---------|---------|----------------|
| `/api/auth/login` | POST | User login | None |
| `/api/auth/register` | POST | User registration | None |
| `/api/auth/verify-otp` | POST | OTP verification | None |
| `/api/courses` | GET | Fetch all courses | None |
| `/api/courses/:id` | GET | Fetch course details | None |
| `/api/courses` | POST | Create new course | Admin JWT |
| `/api/courses/:id` | PUT | Update course | Admin JWT |
| `/api/courses/:id` | DELETE | Delete course | Admin JWT |
| `/api/enquiries` | POST | Submit enquiry | None |
| `/api/enquiries` | GET | Fetch all enquiries | Admin JWT |
| `/api/enrollments` | GET | User enrollments | User JWT |
| `/api/reports/dashboard` | GET | Dashboard stats | Admin JWT |

### API Service Layer (`src/services/api.js`)
```javascript
// Base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Authentication headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Example API calls
export const authAPI = {
  login: (credentials) => fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }),
  // ... other auth methods
};
```

## 📱 Component Documentation

### Core Components

#### NavBar.js
```javascript
// Navigation component with authentication state
Features:
- Dynamic menu based on user role
- Authentication status display
- Responsive mobile menu
- Logout functionality
```

#### ErrorBoundary.js
```javascript
// Error handling wrapper for component tree
Features:
- Catches JavaScript errors in component tree
- Displays fallback UI
- Logs error information
- Graceful error recovery
```

#### OTPLogin.js
```javascript
// OTP authentication component
Features:
- Email/Phone OTP verification
- Resend OTP functionality
- Timer countdown
- Input validation
```

### Page Components

#### Dashboard.js
```javascript
// Main dashboard for users and admins
Features:
- Role-based content display
- Real-time statistics
- Quick action buttons
- Recent activity feed
```

#### Reports.js
```javascript
// Admin reporting interface
Features:
- Dashboard statistics
- Monthly/Yearly reports
- Download functionality
- Data visualization
```

## 🎨 Styling and UI/UX

### Design Principles
- **Mobile-First**: Responsive design starting from mobile
- **Accessibility**: WCAG 2.1 compliant
- **Performance**: Optimized loading and interactions
- **Consistency**: Uniform design language throughout

### CSS Architecture
```css
/* Global Variables */
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --accent-color: #e74c3c;
  --text-color: #2c3e50;
  --background-color: #ecf0f1;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Component Structure */
.component {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}
```

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Build output in 'build' folder
# Optimized and minified files
# Ready for deployment
```

### Deployment Options

#### Netlify Deployment
1. Build the project: `npm run build`
2. Drag and drop `build` folder to Netlify
3. Configure environment variables
4. Set up custom domain (optional)

#### Vercel Deployment
1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
3. Add environment variables
4. Deploy automatically on push

#### Traditional Hosting
1. Build the project: `npm run build`
2. Upload `build` folder contents to web server
3. Configure server for SPA routing
4. Set up HTTPS certificate

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- Role-based access control

### Input Validation
```javascript
// Client-side validation example
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateInput = (data) => {
  const errors = {};
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email is required';
  }
  return errors;
};
```

### Security Headers
- XSS Protection
- Content Security Policy
- Secure API communication
- Input sanitization

## 🧪 Testing

### Available Scripts
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Testing Strategy
- Component unit tests
- Integration tests for API calls
- User interaction testing
- Accessibility testing

## 📊 Performance Optimization

### Code Splitting
```javascript
// Lazy loading for route components
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

// Wrap in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Dashboard />
</Suspense>
```

### Image Optimization
- Compressed images
- Lazy loading
- Responsive images
- WebP format support

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Create Pull Request

### Code Standards
- ESLint configuration
- Prettier formatting
- Component naming conventions
- Git commit message standards

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

- **Documentation**: Full documentation available
- **Issues**: Report bugs via GitHub Issues
- **Email**: Technical support available
- **Community**: Join our developer community

---

**Built with ❤️ by Santhosh-Sks for TVM Academy**

*A modern, scalable, and secure educational management system frontend.*
