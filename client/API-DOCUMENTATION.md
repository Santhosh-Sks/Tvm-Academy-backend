# TVM Academy - Complete API Documentation

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Response Formats](#response-formats)
8. [Testing Guide](#testing-guide)

---

## 1. API Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.tvm-academy.com/api
```

### API Version
```
Version: 1.0
Content-Type: application/json
Accept: application/json
```

### Supported HTTP Methods
- `GET` - Retrieve data
- `POST` - Create new resources
- `PUT` - Update existing resources
- `DELETE` - Remove resources

---

## 2. Authentication

### JWT Token Authentication

#### Headers Required
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Token Structure
```javascript
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin|user",
    "iat": 1642680000,
    "exp": 1642766400
  }
}
```

#### Token Expiry
- **Standard Token**: 24 hours
- **Refresh Token**: 7 days
- **Password Reset Token**: 1 hour

---

## 3. Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information",
    "field": "field_name" // For validation errors
  },
  "timestamp": "2024-01-19T10:30:00.000Z"
}
```

### HTTP Status Codes
| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server error |

---

## 4. Rate Limiting

### Limits
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Public Endpoints**: 200 requests per 15 minutes per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680900
```

---

## 5. API Endpoints

### 5.1 Authentication Endpoints

#### POST /api/auth/register
**Description**: Register a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f7a1234567890abcdef124",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false
    }
  },
  "message": "Registration successful. Please check your email for verification."
}
```

**Validation Rules**:
- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters, must contain uppercase, lowercase, number
- `confirmPassword`: Must match password

---

#### POST /api/auth/login
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "admin@tvm.ac.in",
  "password": "admin123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f7a1234567890abcdef123",
      "name": "Admin User",
      "email": "admin@tvm.ac.in",
      "role": "admin",
      "isVerified": true,
      "lastLogin": "2024-01-19T10:30:00.000Z"
    }
  },
  "message": "Login successful"
}
```

---

#### POST /api/auth/verify-email
**Description**: Verify user email with token

**Request Body**:
```json
{
  "token": "verification_token_here"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "isVerified": true
  }
}
```

---

#### POST /api/auth/forgot-password
**Description**: Request password reset

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

#### POST /api/auth/reset-password
**Description**: Reset password with token

**Request Body**:
```json
{
  "token": "reset_token_here",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### 5.2 Course Management Endpoints

#### GET /api/courses
**Description**: Retrieve all courses with optional filtering

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 10, max: 50)
- `category` (string): Filter by category
- `status` (string): Filter by status (active, inactive)
- `search` (string): Search in title and description
- `sortBy` (string): Sort field (title, fee, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Example Request**:
```
GET /api/courses?page=1&limit=10&category=Programming&search=javascript&sortBy=fee&sortOrder=asc
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "64f7a1234567890abcdef125",
        "title": "Full Stack JavaScript Development",
        "description": "Complete course covering frontend and backend JavaScript development",
        "duration": "6 months",
        "fee": 15000,
        "category": "Programming",
        "level": "Intermediate",
        "instructor": "Jane Smith",
        "maxStudents": 50,
        "currentEnrollments": 25,
        "status": "active",
        "startDate": "2024-02-01T00:00:00.000Z",
        "endDate": "2024-08-01T00:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-19T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCourses": 25,
      "hasNext": true,
      "hasPrev": false,
      "limit": 10
    },
    "filters": {
      "categories": ["Programming", "Design", "Business", "Other"],
      "levels": ["Beginner", "Intermediate", "Advanced"],
      "priceRange": {
        "min": 5000,
        "max": 25000
      }
    }
  }
}
```

---

#### GET /api/courses/:id
**Description**: Get detailed information about a specific course

**Parameters**:
- `id` (string): Course ID

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "64f7a1234567890abcdef125",
      "title": "Full Stack JavaScript Development",
      "description": "Complete course covering frontend and backend JavaScript development including React, Node.js, Express, MongoDB, and deployment strategies.",
      "duration": "6 months",
      "fee": 15000,
      "category": "Programming",
      "level": "Intermediate",
      "instructor": "Jane Smith",
      "instructorBio": "Senior Full Stack Developer with 8+ years of experience",
      "maxStudents": 50,
      "currentEnrollments": 25,
      "status": "active",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-08-01T00:00:00.000Z",
      "syllabus": [
        {
          "week": 1,
          "topic": "HTML5 & CSS3 Fundamentals",
          "duration": "40 hours"
        },
        {
          "week": 2,
          "topic": "JavaScript ES6+ Features",
          "duration": "40 hours"
        }
      ],
      "prerequisites": [
        "Basic computer knowledge",
        "Passion for coding"
      ],
      "learningOutcomes": [
        "Build full stack web applications",
        "Master React.js and Node.js",
        "Deploy applications to cloud platforms"
      ],
      "enrolledStudents": 25,
      "rating": 4.8,
      "reviews": 23,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-19T14:20:00.000Z"
    }
  }
}
```

---

#### POST /api/courses
**Description**: Create a new course (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "title": "Advanced React Development",
  "description": "Deep dive into React ecosystem including hooks, context, performance optimization, and testing strategies.",
  "duration": "3 months",
  "fee": 12000,
  "category": "Programming",
  "level": "Advanced",
  "instructor": "John Tech",
  "instructorBio": "React core team member with 5+ years experience",
  "maxStudents": 30,
  "startDate": "2024-03-01T00:00:00.000Z",
  "endDate": "2024-06-01T00:00:00.000Z",
  "prerequisites": [
    "Solid JavaScript knowledge",
    "Basic React experience"
  ],
  "learningOutcomes": [
    "Master advanced React patterns",
    "Implement performance optimizations",
    "Write comprehensive tests"
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "64f7a1234567890abcdef126",
      "title": "Advanced React Development",
      "description": "Deep dive into React ecosystem...",
      "duration": "3 months",
      "fee": 12000,
      "category": "Programming",
      "level": "Advanced",
      "instructor": "John Tech",
      "status": "active",
      "currentEnrollments": 0,
      "maxStudents": 30,
      "createdAt": "2024-01-19T14:30:00.000Z",
      "updatedAt": "2024-01-19T14:30:00.000Z"
    }
  },
  "message": "Course created successfully"
}
```

**Validation Rules**:
- `title`: Required, 5-200 characters, unique
- `description`: Required, 50-2000 characters
- `duration`: Required, string
- `fee`: Required, number >= 0
- `category`: Required, enum ["Programming", "Design", "Business", "Other"]
- `level`: Required, enum ["Beginner", "Intermediate", "Advanced"]
- `instructor`: Required, 2-100 characters
- `maxStudents`: Optional, number >= 1 (default: 50)

---

#### PUT /api/courses/:id
**Description**: Update an existing course (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Parameters**: `id` (string): Course ID

**Request Body**: Same as POST /api/courses (all fields optional)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "64f7a1234567890abcdef126",
      "title": "Advanced React Development - Updated",
      "description": "Updated description...",
      "updatedAt": "2024-01-19T15:00:00.000Z"
    }
  },
  "message": "Course updated successfully"
}
```

---

#### DELETE /api/courses/:id
**Description**: Delete/Archive a course (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Parameters**: `id` (string): Course ID

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Course archived successfully",
  "data": {
    "courseId": "64f7a1234567890abcdef126",
    "status": "archived"
  }
}
```

**Note**: Courses with active enrollments cannot be deleted, only archived.

---

### 5.3 Enquiry Management Endpoints

#### POST /api/enquiries
**Description**: Submit a course enquiry

**Request Body**:
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+91-9876543210",
  "course": "64f7a1234567890abcdef125",
  "message": "I'm interested in the Full Stack Web Development course. Could you provide more details about the curriculum and job placement assistance?",
  "source": "website"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "enquiry": {
      "_id": "64f7a1234567890abcdef127",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "+91-9876543210",
      "course": {
        "_id": "64f7a1234567890abcdef125",
        "title": "Full Stack Web Development",
        "fee": 15000
      },
      "message": "I'm interested in the Full Stack Web Development course...",
      "status": "new",
      "priority": "medium",
      "source": "website",
      "createdAt": "2024-01-19T14:45:00.000Z"
    }
  },
  "message": "Enquiry submitted successfully. We'll contact you within 24 hours!"
}
```

**Validation Rules**:
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `phone`: Required, valid phone format
- `course`: Required, valid course ID
- `message`: Optional, max 1000 characters
- `source`: Optional, enum ["website", "phone", "email", "referral"]

---

#### GET /api/enquiries
**Description**: Get all enquiries (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 10)
- `status` (string): Filter by status
- `course` (string): Filter by course ID
- `priority` (string): Filter by priority
- `dateFrom` (date): Filter from date
- `dateTo` (date): Filter to date
- `search` (string): Search in name, email, message

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "enquiries": [
      {
        "_id": "64f7a1234567890abcdef127",
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "phone": "+91-9876543210",
        "course": {
          "_id": "64f7a1234567890abcdef125",
          "title": "Full Stack Web Development",
          "fee": 15000,
          "instructor": "Jane Smith"
        },
        "message": "I'm interested in the Full Stack Web Development course...",
        "status": "new",
        "priority": "medium",
        "source": "website",
        "adminNotes": "",
        "followUpDate": null,
        "createdAt": "2024-01-19T14:45:00.000Z",
        "updatedAt": "2024-01-19T14:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalEnquiries": 156,
      "hasNext": true,
      "hasPrev": false
    },
    "stats": {
      "total": 156,
      "new": 23,
      "contacted": 45,
      "approved": 65,
      "payment_sent": 15,
      "enrolled": 8,
      "closed": 0,
      "conversionRate": 72.3,
      "averageResponseTime": "2.4 hours"
    }
  }
}
```

---

#### GET /api/enquiries/:id
**Description**: Get specific enquiry details (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Parameters**: `id` (string): Enquiry ID

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "enquiry": {
      "_id": "64f7a1234567890abcdef127",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "+91-9876543210",
      "course": {
        "_id": "64f7a1234567890abcdef125",
        "title": "Full Stack Web Development",
        "description": "Complete MERN stack course...",
        "fee": 15000,
        "duration": "6 months",
        "instructor": "Jane Smith"
      },
      "message": "I'm interested in the Full Stack Web Development course...",
      "status": "contacted",
      "priority": "high",
      "source": "website",
      "adminNotes": "Called on 19/01/2024. Very interested. Needs to discuss with family.",
      "followUpDate": "2024-01-22T10:00:00.000Z",
      "paymentToken": null,
      "paymentTokenExpiry": null,
      "statusHistory": [
        {
          "status": "new",
          "changedBy": "system",
          "timestamp": "2024-01-19T14:45:00.000Z",
          "notes": "Enquiry submitted"
        },
        {
          "status": "contacted",
          "changedBy": "64f7a1234567890abcdef123",
          "timestamp": "2024-01-19T16:30:00.000Z",
          "notes": "Initial contact made"
        }
      ],
      "createdAt": "2024-01-19T14:45:00.000Z",
      "updatedAt": "2024-01-19T16:30:00.000Z"
    }
  }
}
```

---

#### PUT /api/enquiries/:id/status
**Description**: Update enquiry status (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Parameters**: `id` (string): Enquiry ID

**Request Body**:
```json
{
  "status": "approved",
  "adminNotes": "Student approved for enrollment. Sending payment link.",
  "priority": "high",
  "followUpDate": "2024-01-25T10:00:00.000Z"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "enquiry": {
      "_id": "64f7a1234567890abcdef127",
      "status": "approved",
      "adminNotes": "Student approved for enrollment. Sending payment link.",
      "priority": "high",
      "followUpDate": "2024-01-25T10:00:00.000Z",
      "paymentToken": "pmt_1a2b3c4d5e6f7g8h9i0j",
      "paymentTokenExpiry": "2024-01-20T16:30:00.000Z",
      "updatedAt": "2024-01-19T16:30:00.000Z"
    }
  },
  "message": "Enquiry status updated successfully. Payment link generated."
}
```

**Status Flow**:
1. `new` → Initial enquiry submission
2. `contacted` → Admin has contacted the student
3. `approved` → Enquiry approved for enrollment
4. `payment_sent` → Payment link sent to student
5. `enrolled` → Student has completed payment and enrolled
6. `closed` → Enquiry resolved or cancelled

---

### 5.4 Enrollment Management Endpoints

#### POST /api/enrollments/enroll
**Description**: Direct course enrollment (Authenticated user)

**Headers**: `Authorization: Bearer <user_token>`

**Request Body**:
```json
{
  "courseId": "64f7a1234567890abcdef125",
  "paymentMethod": "card"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "_id": "64f7a1234567890abcdef128",
      "user": "64f7a1234567890abcdef124",
      "course": "64f7a1234567890abcdef125",
      "enrollmentDate": "2024-01-19T15:00:00.000Z",
      "paymentAmount": 15000,
      "paymentStatus": "pending",
      "paymentMethod": "card",
      "status": "enrolled",
      "progress": 0
    },
    "paymentDetails": {
      "transactionId": "txn_1a2b3c4d5e6f7g8h",
      "paymentUrl": "https://payment.gateway.com/pay/xyz123",
      "expiryTime": "2024-01-19T16:00:00.000Z"
    }
  },
  "message": "Enrollment initiated. Please complete payment within 1 hour."
}
```

---

#### POST /api/enrollments/payment-enroll
**Description**: Enrollment via payment token (from enquiry)

**Request Body**:
```json
{
  "paymentToken": "pmt_1a2b3c4d5e6f7g8h9i0j",
  "paymentMethod": "upi",
  "userDetails": {
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "+91-9876543210"
  }
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "_id": "64f7a1234567890abcdef129",
      "enquiry": "64f7a1234567890abcdef127",
      "course": "64f7a1234567890abcdef125",
      "userDetails": {
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "phone": "+91-9876543210"
      },
      "enrollmentDate": "2024-01-19T17:00:00.000Z",
      "paymentAmount": 15000,
      "paymentStatus": "pending",
      "paymentMethod": "upi",
      "status": "enrolled"
    },
    "paymentDetails": {
      "transactionId": "txn_2b3c4d5e6f7g8h9i",
      "paymentUrl": "https://payment.gateway.com/pay/abc456"
    }
  },
  "message": "Enrollment created. Complete payment to confirm."
}
```

---

#### GET /api/enrollments/my-courses
**Description**: Get user's enrolled courses

**Headers**: `Authorization: Bearer <user_token>`

**Query Parameters**:
- `status` (string): Filter by enrollment status
- `page` (number): Page number
- `limit` (number): Results per page

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "_id": "64f7a1234567890abcdef128",
        "course": {
          "_id": "64f7a1234567890abcdef125",
          "title": "Full Stack Web Development",
          "instructor": "Jane Smith",
          "duration": "6 months",
          "startDate": "2024-02-01T00:00:00.000Z",
          "endDate": "2024-08-01T00:00:00.000Z"
        },
        "enrollmentDate": "2024-01-19T15:00:00.000Z",
        "paymentStatus": "completed",
        "status": "enrolled",
        "progress": 25,
        "completedModules": 3,
        "totalModules": 12,
        "certificateEligible": false,
        "nextClass": "2024-01-22T10:00:00.000Z"
      }
    ],
    "summary": {
      "totalEnrollments": 3,
      "activeEnrollments": 2,
      "completedCourses": 1,
      "totalProgress": 45.6
    }
  }
}
```

---

#### PUT /api/enrollments/:id/progress
**Description**: Update course progress

**Headers**: `Authorization: Bearer <user_token>`

**Parameters**: `id` (string): Enrollment ID

**Request Body**:
```json
{
  "progress": 45,
  "moduleCompleted": 5,
  "timeSpent": 120,
  "notes": "Completed JavaScript fundamentals module"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "_id": "64f7a1234567890abcdef128",
      "progress": 45,
      "completedModules": 5,
      "totalTimeSpent": 850,
      "lastActivityDate": "2024-01-19T18:00:00.000Z",
      "certificateEligible": false
    }
  },
  "message": "Progress updated successfully"
}
```

---

### 5.5 Reports & Analytics Endpoints

#### GET /api/reports/dashboard
**Description**: Get dashboard statistics (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `period` (string): Time period (week, month, quarter, year)
- `startDate` (date): Custom start date
- `endDate` (date): Custom end date

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCourses": 15,
      "activeCourses": 12,
      "totalStudents": 245,
      "activeStudents": 198,
      "totalEnrollments": 432,
      "monthlyEnrollments": 45,
      "totalRevenue": 1250000,
      "monthlyRevenue": 125000,
      "pendingEnquiries": 23,
      "conversionRate": 68.5
    },
    "trends": {
      "enrollmentTrend": [
        {
          "period": "2024-01",
          "enrollments": 45,
          "revenue": 125000,
          "newStudents": 38
        },
        {
          "period": "2023-12",
          "enrollments": 38,
          "revenue": 98000,
          "newStudents": 32
        }
      ],
      "courseTrends": [
        {
          "courseId": "64f7a1234567890abcdef125",
          "title": "Full Stack Web Development",
          "enrollments": 89,
          "revenue": 267000,
          "rating": 4.8,
          "completionRate": 78.5
        }
      ]
    },
    "enquiryStats": {
      "total": 156,
      "byStatus": {
        "new": 23,
        "contacted": 45,
        "approved": 65,
        "enrolled": 23
      },
      "bySource": {
        "website": 120,
        "referral": 25,
        "phone": 8,
        "email": 3
      },
      "conversionRate": 65.4,
      "averageResponseTime": "2.3 hours"
    },
    "revenueStats": {
      "totalRevenue": 1250000,
      "monthlyRevenue": 125000,
      "averageOrderValue": 14500,
      "refunds": 15000,
      "netRevenue": 1235000,
      "revenueGrowth": 12.5
    }
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.000Z",
    "type": "month"
  }
}
```

---

#### GET /api/reports/courses
**Description**: Get course performance report (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `courseId` (string): Specific course ID
- `period` (string): Time period
- `metrics` (string): Comma-separated metrics

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "courseId": "64f7a1234567890abcdef125",
        "title": "Full Stack Web Development",
        "metrics": {
          "totalEnrollments": 89,
          "activeEnrollments": 67,
          "completedEnrollments": 22,
          "revenue": 267000,
          "averageProgress": 65.4,
          "completionRate": 78.5,
          "dropoutRate": 12.3,
          "averageRating": 4.8,
          "totalReviews": 45
        },
        "timeline": [
          {
            "month": "2024-01",
            "enrollments": 15,
            "revenue": 45000,
            "completions": 3
          }
        ]
      }
    ]
  }
}
```

---

#### GET /api/reports/students
**Description**: Get student analytics report (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 245,
      "activeStudents": 198,
      "newStudentsThisMonth": 38,
      "averageCoursesPerStudent": 1.8,
      "studentRetentionRate": 85.2
    },
    "demographics": {
      "ageGroups": {
        "18-25": 95,
        "26-35": 120,
        "36-45": 25,
        "46+": 5
      },
      "locations": {
        "Mumbai": 85,
        "Delhi": 65,
        "Bangalore": 55,
        "Other": 40
      }
    },
    "engagement": {
      "averageProgressRate": 68.5,
      "averageTimeSpent": 145,
      "mostActiveHours": ["19:00", "20:00", "21:00"],
      "completionRates": {
        "Programming": 78.5,
        "Design": 82.1,
        "Business": 71.3
      }
    }
  }
}
```

---

#### GET /api/reports/revenue
**Description**: Get revenue analytics report (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `groupBy` (string): Group by (day, week, month, quarter)
- `period` (string): Time period

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 1250000,
      "netRevenue": 1235000,
      "refunds": 15000,
      "averageOrderValue": 14500,
      "revenueGrowth": 12.5,
      "topPaymentMethod": "card"
    },
    "timeline": [
      {
        "period": "2024-01",
        "grossRevenue": 125000,
        "netRevenue": 123500,
        "refunds": 1500,
        "transactions": 45,
        "averageValue": 2778
      }
    ],
    "byCategory": {
      "Programming": 750000,
      "Design": 350000,
      "Business": 150000
    },
    "paymentMethods": {
      "card": 65.2,
      "upi": 25.8,
      "netbanking": 7.1,
      "wallet": 1.9
    }
  }
}
```

---

#### POST /api/reports/export
**Description**: Export report data (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:
```json
{
  "reportType": "dashboard",
  "format": "csv",
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "filters": {
    "courseId": "64f7a1234567890abcdef125",
    "includeDetails": true
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.tvm-academy.com/downloads/report_20240119_150000.csv",
    "fileName": "dashboard_report_jan2024.csv",
    "fileSize": 2048,
    "expiryTime": "2024-01-20T15:00:00.000Z"
  },
  "message": "Report generated successfully. Download link expires in 24 hours."
}
```

---

### 5.6 User Management Endpoints

#### GET /api/users/profile
**Description**: Get current user profile

**Headers**: `Authorization: Bearer <user_token>`

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f7a1234567890abcdef124",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": true,
      "profile": {
        "phone": "+91-9876543210",
        "dateOfBirth": "1995-05-15",
        "address": {
          "street": "123 Main St",
          "city": "Mumbai",
          "state": "Maharashtra",
          "zipCode": "400001",
          "country": "India"
        },
        "education": "B.Tech Computer Science",
        "experience": "2 years",
        "interests": ["web development", "mobile apps"]
      },
      "stats": {
        "totalEnrollments": 3,
        "completedCourses": 1,
        "certificatesEarned": 1,
        "totalHoursLearned": 240
      },
      "lastLogin": "2024-01-19T10:30:00.000Z",
      "createdAt": "2024-01-10T08:15:00.000Z"
    }
  }
}
```

---

#### PUT /api/users/profile
**Description**: Update user profile

**Headers**: `Authorization: Bearer <user_token>`

**Request Body**:
```json
{
  "name": "John Smith",
  "profile": {
    "phone": "+91-9876543211",
    "dateOfBirth": "1995-05-15",
    "address": {
      "street": "456 New St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400002",
      "country": "India"
    },
    "education": "B.Tech Computer Science",
    "experience": "3 years",
    "interests": ["web development", "mobile apps", "AI/ML"]
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f7a1234567890abcdef124",
      "name": "John Smith",
      "profile": {
        "phone": "+91-9876543211",
        "experience": "3 years",
        "interests": ["web development", "mobile apps", "AI/ML"]
      },
      "updatedAt": "2024-01-19T16:00:00.000Z"
    }
  },
  "message": "Profile updated successfully"
}
```

---

#### POST /api/users/change-password
**Description**: Change user password

**Headers**: `Authorization: Bearer <user_token>`

**Request Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 5.7 Admin Management Endpoints

#### GET /api/admin/users
**Description**: Get all users (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Results per page
- `role` (string): Filter by role
- `status` (string): Filter by status
- `search` (string): Search in name, email

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "64f7a1234567890abcdef124",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "isVerified": true,
        "stats": {
          "totalEnrollments": 3,
          "completedCourses": 1
        },
        "lastLogin": "2024-01-19T10:30:00.000Z",
        "createdAt": "2024-01-10T08:15:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalUsers": 245
    }
  }
}
```

---

#### PUT /api/admin/users/:id/role
**Description**: Update user role (Admin only)

**Headers**: `Authorization: Bearer <admin_token>`

**Parameters**: `id` (string): User ID

**Request Body**:
```json
{
  "role": "admin",
  "reason": "Promoting to admin role for course management"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f7a1234567890abcdef124",
      "role": "admin",
      "updatedAt": "2024-01-19T16:30:00.000Z"
    }
  },
  "message": "User role updated successfully"
}
```

---

## 6. Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String(required, 2-50 chars),
  email: String(required, unique, valid email),
  password: String(required, min 6 chars, hashed),
  role: String(enum: ['admin', 'user'], default: 'user'),
  isVerified: Boolean(default: false),
  verificationToken: String,
  verificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  profile: {
    phone: String,
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    education: String,
    experience: String,
    interests: [String]
  },
  lastLogin: Date,
  createdAt: Date(default: now),
  updatedAt: Date(default: now)
}
```

### Course Model
```javascript
{
  _id: ObjectId,
  title: String(required, unique, 5-200 chars),
  description: String(required, 50-2000 chars),
  duration: String(required),
  fee: Number(required, min: 0),
  category: String(required, enum: categories),
  level: String(enum: levels, default: 'Beginner'),
  instructor: String(required, 2-100 chars),
  instructorBio: String(max: 500 chars),
  maxStudents: Number(default: 50),
  currentEnrollments: Number(default: 0),
  status: String(enum: ['active', 'inactive', 'archived'], default: 'active'),
  startDate: Date,
  endDate: Date,
  prerequisites: [String],
  learningOutcomes: [String],
  syllabus: [{
    week: Number,
    topic: String,
    duration: String
  }],
  rating: Number(min: 0, max: 5),
  reviewCount: Number(default: 0),
  createdAt: Date(default: now),
  updatedAt: Date(default: now)
}
```

### Enquiry Model
```javascript
{
  _id: ObjectId,
  name: String(required, trim, max: 100),
  email: String(required, valid email),
  phone: String(required),
  course: ObjectId(ref: 'Course', required),
  message: String(max: 1000),
  status: String(enum: statuses, default: 'new'),
  priority: String(enum: ['low', 'medium', 'high'], default: 'medium'),
  source: String(enum: sources, default: 'website'),
  adminNotes: String,
  followUpDate: Date,
  paymentToken: String,
  paymentTokenExpiry: Date,
  statusHistory: [{
    status: String,
    changedBy: ObjectId(ref: 'User'),
    timestamp: Date(default: now),
    notes: String
  }],
  createdAt: Date(default: now),
  updatedAt: Date(default: now)
}
```

### Enrollment Model
```javascript
{
  _id: ObjectId,
  user: ObjectId(ref: 'User', required),
  course: ObjectId(ref: 'Course', required),
  enquiry: ObjectId(ref: 'Enquiry'),
  enrollmentDate: Date(default: now),
  paymentAmount: Number(required),
  paymentStatus: String(enum: payment_statuses, default: 'pending'),
  paymentMethod: String(enum: payment_methods),
  transactionId: String,
  status: String(enum: enrollment_statuses, default: 'enrolled'),
  progress: Number(min: 0, max: 100, default: 0),
  completedModules: Number(default: 0),
  totalModules: Number(default: 0),
  totalTimeSpent: Number(default: 0),
  lastActivityDate: Date,
  certificateIssued: Boolean(default: false),
  certificateUrl: String,
  completionDate: Date,
  createdAt: Date(default: now),
  updatedAt: Date(default: now)
}
```

---

## 7. Response Formats

### Success Response
```javascript
{
  success: true,
  data: {
    // Response data object
  },
  message: "Operation completed successfully",
  timestamp: "2024-01-19T10:30:00.000Z"
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error message",
  error: {
    code: "ERROR_CODE",
    details: "Detailed error information",
    field: "field_name", // For validation errors
    stack: "error stack trace" // Only in development
  },
  timestamp: "2024-01-19T10:30:00.000Z"
}
```

### Validation Error Response
```javascript
{
  success: false,
  message: "Validation failed",
  error: {
    code: "VALIDATION_ERROR",
    details: "Input validation failed",
    fields: {
      email: ["Email is required", "Must be valid email format"],
      password: ["Password must be at least 6 characters"]
    }
  },
  timestamp: "2024-01-19T10:30:00.000Z"
}
```

### Pagination Response
```javascript
{
  success: true,
  data: {
    items: [/* array of items */],
    pagination: {
      currentPage: 1,
      totalPages: 10,
      totalItems: 95,
      itemsPerPage: 10,
      hasNext: true,
      hasPrev: false,
      nextPage: 2,
      prevPage: null
    }
  }
}
```

---

## 8. Testing Guide

### API Testing with Curl

#### Authentication Test
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Course Management Test
```bash
# Get all courses
curl -X GET http://localhost:5000/api/courses

# Get specific course
curl -X GET http://localhost:5000/api/courses/COURSE_ID

# Create new course (admin only)
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "This is a test course description with sufficient length to meet requirements",
    "duration": "2 months",
    "fee": 10000,
    "category": "Programming",
    "instructor": "Test Instructor"
  }'
```

#### Enquiry Test
```bash
# Submit enquiry
curl -X POST http://localhost:5000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Enquirer",
    "email": "enquirer@example.com",
    "phone": "+91-9876543210",
    "course": "COURSE_ID",
    "message": "I am interested in this course"
  }'

# Get enquiries (admin only)
curl -X GET http://localhost:5000/api/enquiries \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### API Testing with Postman

#### Environment Variables
```json
{
  "name": "TVM Academy API",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api",
      "enabled": true
    },
    {
      "key": "userToken",
      "value": "",
      "enabled": true
    },
    {
      "key": "adminToken",
      "value": "",
      "enabled": true
    }
  ]
}
```

#### Pre-request Scripts
```javascript
// Set authorization header
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('userToken')
});
```

#### Test Scripts
```javascript
// Test successful response
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success property", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response has data property", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});

// Save token from login response
if (pm.response.json().data && pm.response.json().data.token) {
    pm.environment.set('userToken', pm.response.json().data.token);
}
```

---

This comprehensive API documentation provides complete details for integrating with the TVM Academy backend system. All endpoints include request/response examples, validation rules, and error handling information.
