# 🚀 TVM Academy Backend

Node.js/Express backend for the TVM Academy learning management system.

## 🌐 Live API
[https://tvm-academy-backend.onrender.com](https://tvm-academy-backend.onrender.com)

## 🛠 Technology Stack
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt Password Hashing
- Nodemailer Email Service
- CORS enabled

## 📁 Project Structure
```
server/
├── config/
│   └── seed.js              # Database seeding
├── controllers/             # Route controllers
│   ├── authController.js    # Authentication logic
│   ├── courseController.js  # Course management
│   ├── enquiryController.js
│   └── ...
├── middleware/              # Custom middleware
│   ├── auth.js             # JWT verification
│   └── adminOnly.js        # Admin access control
├── models/                  # Mongoose schemas
│   ├── User.js             # User model with phone
│   ├── Course.js           # Course model
│   ├── OTP.js              # OTP verification
│   └── ...
├── routes/                  # API routes
│   ├── auth.js             # Authentication routes
│   ├── courses.js          # Course routes
│   └── ...
├── services/               # Business logic
│   └── emailService.js     # Email functionality
├── server.js               # Main application
└── package.json
```

## ✨ Features

### 🔐 Authentication
- **Registration**: Name, Email, Phone, Password validation
- **Email verification**: OTP-based with fallback
- **JWT tokens**: Secure authentication
- **Password hashing**: Bcrypt encryption

### 📊 API Endpoints

#### Health Check
```http
GET /api/health
```

#### Authentication
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
```

#### Courses
```http
GET /api/courses
POST /api/courses (Admin only)
PUT /api/courses/:id (Admin only)
DELETE /api/courses/:id (Admin only)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation
```bash
cd server
npm install
cp .env.example .env
# Configure your .env file
npm start
```

### Environment Variables
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

## 🌐 Deployment
Deployed automatically to Render from GitHub pushes.

**Render Settings:**
- Build Command: `cd server && npm install`
- Start Command: `cd server && node server.js`
- Environment: Node.js
