# TVM Academy - Complete System Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Control Flow Diagrams](#control-flow-diagrams)
4. [System Architecture](#system-architecture)
5. [Database Design](#database-design)
6. [API Documentation](#api-documentation)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)

---

## 1. System Overview

### 1.1 Project Description
TVM Academy Education Management System is a comprehensive web application designed to streamline educational operations including course management, student enrollment, inquiry handling, and administrative reporting.

### 1.2 System Objectives
- Centralize course and student data management
- Automate inquiry and enrollment processes
- Provide real-time analytics and reporting
- Ensure secure access control and data protection
- Enable scalable multi-user operations

### 1.3 System Scope
**Included:**
- Course catalog management
- Student registration and enrollment
- Inquiry lifecycle management
- Payment processing integration
- Administrative dashboard and reports
- Role-based access control

**Excluded:**
- Live video streaming
- Advanced learning management features
- Third-party LMS integration
- Mobile application (Phase 2)

---

## 2. Data Flow Diagrams

### 2.1 Context Diagram (Level 0)

```
                    ┌─────────────────────────────────┐
                    │                                 │
    ┌─────────┐     │                                 │     ┌─────────────┐
    │ Student │────▶│      TVM Academy System        │────▶│ Administrator│
    │         │◀────│                                 │◀────│             │
    └─────────┘     │                                 │     └─────────────┘
                    │                                 │
    ┌─────────┐     │                                 │     ┌─────────────┐
    │Visitor/ │────▶│                                 │────▶│   Payment   │
    │ Guest   │     │                                 │     │   Gateway   │
    └─────────┘     │                                 │     └─────────────┘
                    │                                 │
                    │                                 │     ┌─────────────┐
                    │                                 │────▶│ Email Service│
                    │                                 │     │             │
                    └─────────────────────────────────┘     └─────────────┘

External Entities:
- Student: Registered users who can enroll in courses
- Visitor/Guest: Public users browsing courses and submitting inquiries  
- Administrator: System administrators managing courses and data
- Payment Gateway: External payment processing service
- Email Service: External email notification service
```

### 2.2 Level 1 DFD - Main System Processes

```
                     ┌─────────────────────────────────────────────────────┐
                     │                 TVM Academy System                  │
                     │                                                     │
   Student ────────▶ │  1.0                    2.0                    3.0  │
                     │ User                  Course                Course   │ ────▶ Administrator
                     │Management           Management            Enrollment │
   Guest   ────────▶ │                                                     │
                     │                                                     │
                     │  4.0                    5.0                    6.0  │
                     │Inquiry              Payment                Reports   │
                     │Management          Processing            Generation  │
                     │                                                     │
                     │                                                     │
                     │                   7.0                               │
                     │              Authentication                         │
                     │                 & Security                          │
                     └─────────────────────────────────────────────────────┘
                                            │
                                            ▼
                                    ┌─────────────┐
                                    │  Database   │
                                    │    (MongoDB)│
                                    └─────────────┘

Process Descriptions:
1.0 User Management - Handle user registration, profile management
2.0 Course Management - CRUD operations for courses
3.0 Course Enrollment - Handle student enrollment in courses
4.0 Inquiry Management - Process and track student inquiries
5.0 Payment Processing - Handle payment transactions
6.0 Reports Generation - Generate analytics and reports
7.0 Authentication & Security - Handle login/logout and access control
```

### 2.3 Level 2 DFD - User Management Process (1.0)

```
                    ┌─────────────────────────────────────────────┐
                    │           User Management (1.0)            │
                    │                                             │
   Student ────────▶│  1.1              1.2              1.3     │
                    │ User            Profile           Account   │
                    │Registration     Management        Verification│
                    │                                             │
                    │  1.4              1.5              1.6     │
                    │Password         Login/Logout     Role      │ ────▶ Admin
                    │Management       Handling        Management  │
   Guest   ────────▶│                                             │
                    │                                             │
                    └─────────────────────────────────────────────┘
                                         │
                                         ▼
                               ┌─────────────────┐
                               │  User Database  │
                               │   Collection    │
                               └─────────────────┘

Data Flows:
- User Registration Data: Name, Email, Password, Role
- Profile Updates: Personal information changes
- Authentication Tokens: JWT tokens for session management
- Verification Codes: Email/OTP verification
```

### 2.4 Level 2 DFD - Course Management Process (2.0)

```
                    ┌─────────────────────────────────────────────┐
                    │          Course Management (2.0)           │
                    │                                             │
   Admin   ────────▶│  2.1              2.2              2.3     │
                    │ Course          Course            Course   │
                    │Creation         Modification      Deletion  │
                    │                                             │
                    │  2.4              2.5              2.6     │
                    │Course           Course            Course   │ ────▶ Student
                    │Listing          Details           Search    │
   Student ────────▶│                                             │
                    │                                             │
   Guest   ────────▶│                                             │
                    └─────────────────────────────────────────────┘
                                         │
                                         ▼
                               ┌─────────────────┐
                               │ Course Database │
                               │   Collection    │
                               └─────────────────┘

Data Flows:
- Course Data: Title, Description, Duration, Fee, Category
- Course Filters: Search criteria and sorting options
- Course Catalog: Public course listings
- Course Analytics: Enrollment statistics and performance data
```

---

## 3. Control Flow Diagrams

### 3.1 User Authentication Flow

```
                    START
                      │
                      ▼
              ┌───────────────┐
              │ User Access   │
              │ Application   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐         NO    ┌─────────────┐
              │ Token Exists  │──────────────▶│ Redirect to │
              │ and Valid?    │               │ Login Page  │
              └───────┬───────┘               └─────────────┘
                      │ YES
                      ▼
              ┌───────────────┐
              │ Extract User  │
              │ Role from     │
              │ Token         │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Check Route   │
              │ Permissions   │
              └───────┬───────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Public  │  │  User   │  │ Admin   │
   │ Access  │  │ Access  │  │ Access  │
   └─────────┘  └─────────┘  └─────────┘
         │            │            │
         └────────────┼────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Grant Access  │
              │ to Route      │
              └───────────────┘
                      │
                      ▼
                    END
```

### 3.2 Course Enrollment Flow

```
                    START
                      │
                      ▼
              ┌───────────────┐
              │ Student       │
              │ Selects       │
              │ Course        │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐         NO    ┌─────────────┐
              │ User          │──────────────▶│ Redirect to │
              │ Authenticated?│               │ Login       │
              └───────┬───────┘               └─────────────┘
                      │ YES
                      ▼
              ┌───────────────┐         YES   ┌─────────────┐
              │ Already       │──────────────▶│ Show        │
              │ Enrolled?     │               │ "Already    │
              └───────┬───────┘               │ Enrolled"   │
                      │ NO                    └─────────────┘
                      ▼
              ┌───────────────┐
              │ Check Course  │
              │ Availability  │
              └───────┬───────┘
                      │
              ┌───────▼───────┐         NO    ┌─────────────┐
              │ Course        │──────────────▶│ Show        │
              │ Available?    │               │ "Course     │
              └───────┬───────┘               │ Full"       │
                      │ YES                   └─────────────┘
                      ▼
              ┌───────────────┐
              │ Display       │
              │ Payment Form  │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Process       │
              │ Payment       │
              └───────┬───────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Payment  │ │Payment  │ │Payment  │
    │Success  │ │Failed   │ │Pending  │
    └─────┬───┘ └─────┬───┘ └─────┬───┘
          │           │           │
          ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Enroll   │ │Show     │ │Wait for │
    │Student  │ │Error    │ │Confirm  │
    └─────────┘ └─────────┘ └─────────┘
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
                    END
```

### 3.3 Inquiry Management Flow

```
                    START
                      │
                      ▼
              ┌───────────────┐
              │ Visitor       │
              │ Submits       │
              │ Inquiry       │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Validate      │
              │ Form Data     │
              └───────┬───────┘
                      │
              ┌───────▼───────┐         NO    ┌─────────────┐
              │ Data Valid?   │──────────────▶│ Show        │
              └───────┬───────┘               │ Validation  │
                      │ YES                   │ Errors      │
                      ▼                       └─────────────┘
              ┌───────────────┐
              │ Save Inquiry  │
              │ to Database   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Send          │
              │ Confirmation  │
              │ Email         │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Notify        │
              │ Admin         │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Admin Reviews │
              │ Inquiry       │
              └───────┬───────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Approve  │ │Request  │ │Reject   │
    │Inquiry  │ │More Info│ │Inquiry  │
    └─────┬───┘ └─────┬───┘ └─────┬───┘
          │           │           │
          ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Generate │ │Send     │ │Send     │
    │Payment  │ │Follow-up│ │Rejection│
    │Link     │ │Email    │ │Email    │
    └─────────┘ └─────────┘ └─────────┘
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
                    END
```

---

## 4. System Architecture

### 4.1 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                        │
│                         (Client-Side)                          │
├─────────────────────────────────────────────────────────────────┤
│  React.js Frontend (Port 3000)                                │
│  ├── Components (NavBar, Forms, Tables)                       │
│  ├── Pages (Home, Dashboard, Login, Courses)                  │
│  ├── Services (API calls, Authentication)                     │
│  ├── Routing (React Router DOM)                               │
│  └── State Management (React Hooks)                           │
│                                                                │
│  Browser Technologies:                                         │
│  ├── HTML5, CSS3, JavaScript ES6+                            │
│  ├── Local Storage (JWT tokens)                               │
│  ├── Session Storage (temporary data)                         │
│  └── Responsive Design (Mobile-first)                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS Requests
                                 │ JSON Data Exchange
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION TIER                         │
│                        (Server-Side)                           │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express.js Backend (Port 5000)                     │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Routes    │  │Controllers  │  │ Middleware  │           │
│  │             │  │             │  │             │           │
│  │ • auth.js   │  │ • authCtrl  │  │ • auth.js   │           │
│  │ • courses.js│  │ • courseCtrl│  │ • adminOnly │           │
│  │ • enquiry.js│  │ • enquiryCtrl│  │ • cors      │           │
│  │ • reports.js│  │ • reportCtrl│  │ • helmet    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Models    │  │ Validation  │  │   Services  │           │
│  │             │  │             │  │             │           │
│  │ • User.js   │  │ • Joi       │  │ • emailSvc  │           │
│  │ • Course.js │  │ • express   │  │ • paymentSvc│           │
│  │ • Enquiry.js│  │ • validator │  │ • authSvc   │           │
│  │ • Enroll.js │  │             │  │ • reportSvc │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Database Connections
                                 │ Mongoose ODM
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATA TIER                              │
│                       (Database Layer)                         │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database (Port 27017)                                │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ Collections │  │   Indexes   │  │ Aggregation │           │
│  │             │  │             │  │ Pipelines   │           │
│  │ • users     │  │ • email_idx │  │             │           │
│  │ • courses   │  │ • title_idx │  │ • enrollment│           │
│  │ • enquiries │  │ • date_idx  │  │   stats     │           │
│  │ • enrollments│ │ • status_idx│  │ • revenue   │           │
│  │ • reports   │  │             │  │   reports   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Backup    │  │ Replication │  │  Security   │           │
│  │             │  │             │  │             │           │
│  │ • Daily     │  │ • Primary   │  │ • Auth      │           │
│  │ • Weekly    │  │ • Secondary │  │ • Encryption│           │
│  │ • Monthly   │  │ • Arbiter   │  │ • Access    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Architecture (Frontend)

```
                         App.js (Root Component)
                              │
                              ▼
                    ┌─────────────────┐
                    │    Routing      │
                    │ (React Router)  │
                    └─────────┬───────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   Public    │  │    Auth     │  │   Admin     │
    │   Routes    │  │   Routes    │  │   Routes    │
    └─────┬───────┘  └─────┬───────┘  └─────┬───────┘
          │                │                │
          ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │ Home    │      │Dashboard│      │ Manage  │
    │ Courses │      │ Profile │      │ Courses │
    │ Enquiry │      │MyCourses│      │ Reports │
    │ Login   │      │ Payment │      │Enquiries│
    └─────────┘      └─────────┘      └─────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │   Shared        │
                 │ Components      │
                 ├─────────────────┤
                 │ • NavBar        │
                 │ • ErrorBoundary │
                 │ • LoadingSpinner│
                 │ • Modal         │
                 │ • FormElements  │
                 └─────────────────┘
```

### 4.3 Backend API Architecture

```
                    Express.js Application
                            │
                            ▼
                    ┌───────────────┐
                    │   Middleware  │
                    │   Pipeline    │
                    ├───────────────┤
                    │ • CORS        │
                    │ • Helmet      │
                    │ • Morgan      │
                    │ • Body Parser │
                    │ • Rate Limit  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Routes     │
                    │   Handlers    │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │    Auth     │ │   Courses   │ │  Enquiries  │
      │   Routes    │ │   Routes    │ │   Routes    │
      └─────┬───────┘ └─────┬───────┘ └─────┬───────┘
            │               │               │
            ▼               ▼               ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │    Auth     │ │   Course    │ │   Enquiry   │
      │ Controller  │ │ Controller  │ │ Controller  │
      └─────┬───────┘ └─────┬───────┘ └─────┬───────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Models     │
                    │  (Mongoose)   │
                    ├───────────────┤
                    │ • User.js     │
                    │ • Course.js   │
                    │ • Enquiry.js  │
                    │ • Enrollment.js│
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   MongoDB     │
                    │   Database    │
                    └───────────────┘
```

---

## 5. Database Design

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      Users      │         │     Courses     │         │   Enquiries     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ _id: ObjectId   │         │ _id: ObjectId   │         │ _id: ObjectId   │
│ name: String    │         │ title: String   │         │ name: String    │
│ email: String   │         │ description: Text│        │ email: String   │
│ password: String│         │ duration: String│         │ phone: String   │
│ role: String    │         │ fee: Number     │         │ course: ObjectId│
│ isVerified: Bool│         │ category: String│         │ message: Text   │
│ createdAt: Date │         │ status: String  │         │ status: String  │
│ updatedAt: Date │         │ createdAt: Date │         │ createdAt: Date │
└─────────────────┘         │ updatedAt: Date │         │ updatedAt: Date │
           │                └─────────────────┘         └─────────────────┘
           │                          │                           │
           │                          │                           │
           │                          ▼                           │
           │                ┌─────────────────┐                   │
           │                │ Course_Enquiry  │◀──────────────────┘
           │                │   Relationship  │
           │                ├─────────────────┤
           │                │ enquiry_id      │
           │                │ course_id       │
           │                └─────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────┐         ┌─────────────────┐
│   Enrollments   │         │    Payments     │
├─────────────────┤         ├─────────────────┤
│ _id: ObjectId   │         │ _id: ObjectId   │
│ user: ObjectId  │◀────────│ enrollment: Ref │
│ course: ObjectId│         │ amount: Number  │
│ enrollDate: Date│         │ status: String  │
│ paymentStatus   │         │ method: String  │
│ status: String  │         │ transactionId   │
│ progress: Number│         │ createdAt: Date │
│ createdAt: Date │         │ updatedAt: Date │
│ updatedAt: Date │         └─────────────────┘
└─────────────────┘
```

### 5.2 Collection Schemas

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    select: false // Don't include in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### Courses Collection
```javascript
{
  _id: ObjectId,
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  duration: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'Design', 'Business', 'Other']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  maxStudents: {
    type: Number,
    default: 50
  },
  currentEnrollments: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  instructor: {
    type: String,
    required: true
  },
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### Enquiries Collection
```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  phone: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  message: {
    type: String,
    maxLength: 1000
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'approved', 'payment_sent', 'enrolled', 'closed'],
    default: 'new'
  },
  paymentToken: String,
  paymentTokenExpiry: Date,
  adminNotes: String,
  followUpDate: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'referral'],
    default: 'website'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

#### Enrollments Collection
```javascript
{
  _id: ObjectId,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enquiry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet']
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped', 'expired'],
    default: 'enrolled'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  completionDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### 5.3 Database Indexes

```javascript
// Users Collection Indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "createdAt": 1 })

// Courses Collection Indexes
db.courses.createIndex({ "title": "text", "description": "text" })
db.courses.createIndex({ "category": 1 })
db.courses.createIndex({ "status": 1 })
db.courses.createIndex({ "fee": 1 })
db.courses.createIndex({ "createdAt": -1 })

// Enquiries Collection Indexes
db.enquiries.createIndex({ "email": 1 })
db.enquiries.createIndex({ "status": 1 })
db.enquiries.createIndex({ "course": 1 })
db.enquiries.createIndex({ "createdAt": -1 })
db.enquiries.createIndex({ "paymentToken": 1 })

// Enrollments Collection Indexes
db.enrollments.createIndex({ "user": 1, "course": 1 }, { unique: true })
db.enrollments.createIndex({ "paymentStatus": 1 })
db.enrollments.createIndex({ "status": 1 })
db.enrollments.createIndex({ "enrollmentDate": -1 })

// Compound Indexes for Common Queries
db.enquiries.createIndex({ "status": 1, "createdAt": -1 })
db.enrollments.createIndex({ "user": 1, "status": 1 })
db.courses.createIndex({ "status": 1, "category": 1 })
```

---

## 6. API Documentation

### 6.1 Authentication APIs

#### POST /api/auth/login
**Description:** Authenticate user and return JWT token

**Request Body:**
```json
{
  "email": "admin@tvm.ac.in",
  "password": "admin123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f7a1234567890abcdef123",
      "name": "Admin User",
      "email": "admin@tvm.ac.in",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

#### POST /api/auth/register
**Description:** Register new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f7a1234567890abcdef124",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "message": "Registration successful. Please verify your email."
}
```

### 6.2 Course Management APIs

#### GET /api/courses
**Description:** Retrieve all active courses

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of courses per page
- `category` (optional): Filter by course category
- `search` (optional): Search in title and description

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "64f7a1234567890abcdef125",
        "title": "Full Stack Web Development",
        "description": "Complete MERN stack course...",
        "duration": "6 months",
        "fee": 15000,
        "category": "Programming",
        "instructor": "Jane Smith",
        "currentEnrollments": 25,
        "maxStudents": 50,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCourses": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### POST /api/courses
**Description:** Create new course (Admin only)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Advanced React Development",
  "description": "Deep dive into React ecosystem including hooks, context, and performance optimization",
  "duration": "3 months",
  "fee": 12000,
  "category": "Programming",
  "instructor": "John Tech",
  "maxStudents": 30,
  "startDate": "2024-02-01T00:00:00.000Z"
}
```

**Response (Success - 201):**
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
      "instructor": "John Tech",
      "status": "active",
      "currentEnrollments": 0,
      "maxStudents": 30,
      "createdAt": "2024-01-19T14:30:00.000Z"
    }
  },
  "message": "Course created successfully"
}
```

### 6.3 Enquiry Management APIs

#### POST /api/enquiries
**Description:** Submit course enquiry

**Request Body:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+91-9876543210",
  "course": "64f7a1234567890abcdef125",
  "message": "I'm interested in the Full Stack Web Development course. Could you provide more details about the curriculum?"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "enquiry": {
      "_id": "64f7a1234567890abcdef127",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "phone": "+91-9876543210",
      "course": "64f7a1234567890abcdef125",
      "message": "I'm interested in the Full Stack Web Development course...",
      "status": "new",
      "createdAt": "2024-01-19T14:45:00.000Z"
    }
  },
  "message": "Enquiry submitted successfully. We'll contact you soon!"
}
```

#### GET /api/enquiries
**Description:** Get all enquiries (Admin only)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by enquiry status
- `course` (optional): Filter by course ID
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response (Success - 200):**
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
          "fee": 15000
        },
        "message": "I'm interested in the Full Stack Web Development course...",
        "status": "new",
        "priority": "medium",
        "createdAt": "2024-01-19T14:45:00.000Z"
      }
    ],
    "stats": {
      "total": 156,
      "new": 23,
      "contacted": 45,
      "approved": 78,
      "enrolled": 10
    }
  }
}
```

### 6.4 Enrollment APIs

#### POST /api/enrollments/enroll
**Description:** Enroll user in course

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "64f7a1234567890abcdef125",
  "paymentMethod": "card"
}
```

**Response (Success - 201):**
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
      "status": "enrolled",
      "progress": 0
    },
    "paymentUrl": "https://payment.gateway.com/pay/xyz123"
  },
  "message": "Enrollment initiated. Please complete payment."
}
```

### 6.5 Reports APIs

#### GET /api/reports/dashboard
**Description:** Get dashboard statistics (Admin only)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCourses": 15,
      "activeCourses": 12,
      "totalStudents": 245,
      "totalEnrollments": 432,
      "monthlyRevenue": 125000,
      "pendingEnquiries": 23
    },
    "enrollmentTrends": [
      {
        "month": "January",
        "enrollments": 45,
        "revenue": 125000
      },
      {
        "month": "December",
        "enrollments": 38,
        "revenue": 98000
      }
    ],
    "topCourses": [
      {
        "courseId": "64f7a1234567890abcdef125",
        "title": "Full Stack Web Development",
        "enrollments": 89,
        "revenue": 267000
      }
    ],
    "enquiryStats": {
      "total": 156,
      "conversionRate": 65.4,
      "averageResponseTime": "2.3 hours"
    }
  }
}
```

---

## 7. Security Architecture

### 7.1 Authentication & Authorization Flow

```
┌─────────────┐    1. Login Request     ┌─────────────────┐
│   Client    │─────────────────────────▶│   Auth Server   │
│ (React App) │                         │  (Node.js API)  │
└─────────────┘                         └─────────────────┘
       │                                         │
       │         2. Validate Credentials        │
       │                                         ▼
       │                                ┌─────────────────┐
       │                                │    Database     │
       │                                │   (MongoDB)     │
       │                                └─────────────────┘
       │                                         │
       │         3. Generate JWT Token          │
       │                ◀────────────────────────┘
       │                                         │
       ▼         4. Return Token & User Info    │
┌─────────────┐◀─────────────────────────────────┘
│ Local       │
│ Storage     │
│ (JWT Token) │
└─────────────┘
       │
       │         5. API Requests with Token
       ▼
┌─────────────┐    Authorization Header   ┌─────────────────┐
│   Client    │─────────────────────────▶│ Protected Route │
│ (React App) │                         │   (Node.js)     │
└─────────────┘                         └─────────────────┘
                                                │
                          6. Verify Token      │
                                                ▼
                                       ┌─────────────────┐
                                       │ JWT Middleware  │
                                       │ • Verify Token  │
                                       │ • Extract User  │
                                       │ • Check Roles   │
                                       └─────────────────┘
```

### 7.2 JWT Token Structure

```javascript
// JWT Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// JWT Payload
{
  "id": "64f7a1234567890abcdef124",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1642680000,     // Issued at
  "exp": 1642766400      // Expires at (24 hours)
}

// JWT Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET_KEY
)
```

### 7.3 Security Measures

#### Input Validation & Sanitization
```javascript
// Example validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// Joi validation schema
const userRegistrationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
});
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  skipSuccessfulRequests: true
});
```

#### CORS Configuration
```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tvm-academy.com', 'https://www.tvm-academy.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

### 7.4 Data Protection

#### Password Security
```javascript
const bcrypt = require('bcryptjs');

// Password hashing before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password verification
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

#### Environment Variables Security
```bash
# .env file (never commit to repository)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=24h
BCRYPT_ROUNDS=12

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment Gateway (if applicable)
PAYMENT_GATEWAY_KEY=your-payment-key
PAYMENT_GATEWAY_SECRET=your-payment-secret
```

---

## 8. Deployment Architecture

### 8.1 Production Deployment Diagram

```
                              INTERNET
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Load Balancer      │
                    │    (Nginx/CloudFlare)   │
                    │  • SSL Termination      │
                    │  • Rate Limiting        │
                    │  • DDoS Protection      │
                    └─────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
         ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
         │   Frontend  │  │   Frontend  │  │   Frontend  │
         │   Instance  │  │   Instance  │  │   Instance  │
         │   (React)   │  │   (React)   │  │   (React)   │
         │   Port:80   │  │   Port:80   │  │   Port:80   │
         └─────────────┘  └─────────────┘  └─────────────┘
                                 │
                                 │ API Calls
                                 ▼
                    ┌─────────────────────────┐
                    │    API Load Balancer    │
                    │      (Nginx/HAProxy)    │
                    └─────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
         ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
         │   Backend   │  │   Backend   │  │   Backend   │
         │   Instance  │  │   Instance  │  │   Instance  │
         │  (Node.js)  │  │  (Node.js)  │  │  (Node.js)  │
         │  Port:5000  │  │  Port:5000  │  │  Port:5000  │
         └─────────────┘  └─────────────┘  └─────────────┘
                    │            │            │
                    └────────────┼────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Database Cluster   │
                    │        (MongoDB)        │
                    ├─────────────────────────┤
                    │ Primary    │ Secondary  │
                    │ Instance   │ Instance   │
                    │ Port:27017 │ Port:27017 │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      External Services  │
                    ├─────────────────────────┤
                    │ • Email Service (SMTP)  │
                    │ • Payment Gateway       │
                    │ • File Storage (AWS S3) │
                    │ • Monitoring Services   │
                    └─────────────────────────┘
```

### 8.2 Development vs Production Environment

| Aspect | Development | Production |
|--------|-------------|------------|
| **Frontend** | `npm start` (Port 3000) | Static files served by Nginx |
| **Backend** | `nodemon` (Port 5000) | PM2 process manager |
| **Database** | Local MongoDB | MongoDB Atlas Cluster |
| **SSL** | HTTP (no encryption) | HTTPS with SSL certificate |
| **Environment** | `.env.development` | `.env.production` |
| **Logging** | Console output | File-based + centralized |
| **Error Handling** | Detailed error messages | Generic error responses |
| **Performance** | Source maps enabled | Minified and optimized |

### 8.3 CI/CD Pipeline

```
┌─────────────────┐    git push     ┌─────────────────┐
│   Developer     │ ──────────────▶ │   GitHub Repo   │
│   Local Machine │                 │   (Source Code) │
└─────────────────┘                 └─────────────────┘
                                             │
                                             │ Webhook Trigger
                                             ▼
                                    ┌─────────────────┐
                                    │   CI Pipeline   │
                                    │ (GitHub Actions)│
                                    ├─────────────────┤
                                    │ 1. Code Checkout│
                                    │ 2. Install Deps │
                                    │ 3. Run Tests    │
                                    │ 4. Build Project│
                                    │ 5. Security Scan│
                                    └─────────────────┘
                                             │
                              ┌─────────────┼─────────────┐
                              │ Build Pass  │ Build Fail  │
                              ▼             ▼             
                    ┌─────────────┐   ┌─────────────────┐
                    │Deploy Stage │   │ Notify Developer│
                    │             │   │ • Email Alert   │
                    │• Production │   │ • Slack Message │
                    │• Staging    │   │ • Build Logs    │
                    └─────────────┘   └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Post Deployment │
                    ├─────────────────┤
                    │ • Health Checks │
                    │ • Performance   │
                    │ • Monitoring    │
                    │ • Rollback Plan │
                    └─────────────────┘
```

### 8.4 Monitoring and Logging Architecture

```
                    ┌─────────────────────────────────────┐
                    │           Application Layer          │
                    ├─────────────────────────────────────┤
                    │ Frontend (React) │ Backend (Node.js) │
                    │ • Console Logs   │ • Winston Logger  │
                    │ • Error Boundary │ • Morgan HTTP     │
                    │ • Performance    │ • Custom Metrics  │
                    └─────────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │          Logging Pipeline           │
                    ├─────────────────────────────────────┤
                    │ • Log Aggregation (ELK Stack)      │
                    │ • Error Tracking (Sentry)          │
                    │ • Performance Monitoring (New Relic)│
                    └─────────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         Alerting System             │
                    ├─────────────────────────────────────┤
                    │ • Email Notifications              │
                    │ • Slack Integrations               │
                    │ • SMS Alerts (Critical)            │
                    │ • Dashboard Visualization          │
                    └─────────────────────────────────────┘
```

---

## 9. Testing Strategy

### 9.1 Test Pyramid

```
                        ┌─────────────────┐
                        │   E2E Tests     │
                        │  (Cypress/Jest) │
                        │     [Few]       │
                        └─────────────────┘
                               │
                    ┌─────────────────────────┐
                    │   Integration Tests     │
                    │   (API + Database)      │
                    │       [Some]            │
                    └─────────────────────────┘
                               │
              ┌─────────────────────────────────────┐
              │          Unit Tests                 │
              │    (Components + Functions)         │
              │            [Many]                   │
              └─────────────────────────────────────┘
```

### 9.2 Testing Checklist

#### Frontend Testing
- [ ] Component rendering tests
- [ ] User interaction tests
- [ ] Form validation tests
- [ ] API integration tests
- [ ] Routing tests
- [ ] Accessibility tests

#### Backend Testing
- [ ] API endpoint tests
- [ ] Database operation tests
- [ ] Authentication tests
- [ ] Authorization tests
- [ ] Input validation tests
- [ ] Error handling tests

#### Integration Testing
- [ ] Frontend-Backend communication
- [ ] Database transactions
- [ ] Email service integration
- [ ] Payment gateway integration

#### End-to-End Testing
- [ ] Complete user workflows
- [ ] Admin operations
- [ ] Error scenarios
- [ ] Performance testing

---

## 10. Performance Optimization

### 10.1 Frontend Optimization

```javascript
// Code Splitting
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));

// Memoization
import { memo, useMemo, useCallback } from 'react';

const CourseCard = memo(({ course }) => {
  const formattedPrice = useMemo(() => 
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(course.fee), [course.fee]
  );

  return <div>{/* Course card content */}</div>;
});

// Virtual Scrolling for Large Lists
import { FixedSizeList as List } from 'react-window';

const CourseList = ({ courses }) => (
  <List
    height={400}
    itemCount={courses.length}
    itemSize={120}
    itemData={courses}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <CourseCard course={data[index]} />
      </div>
    )}
  </List>
);
```

### 10.2 Backend Optimization

```javascript
// Database Query Optimization
// Bad: N+1 Query Problem
const courses = await Course.find();
for (let course of courses) {
  course.enrollments = await Enrollment.find({ course: course._id });
}

// Good: Use Aggregation Pipeline
const coursesWithEnrollments = await Course.aggregate([
  {
    $lookup: {
      from: 'enrollments',
      localField: '_id',
      foreignField: 'course',
      as: 'enrollments'
    }
  },
  {
    $addFields: {
      enrollmentCount: { $size: '$enrollments' }
    }
  }
]);

// Caching Strategy
const Redis = require('redis');
const client = Redis.createClient();

const getCourses = async () => {
  const cacheKey = 'courses:active';
  let courses = await client.get(cacheKey);
  
  if (!courses) {
    courses = await Course.find({ status: 'active' });
    await client.setex(cacheKey, 300, JSON.stringify(courses)); // 5 min cache
  } else {
    courses = JSON.parse(courses);
  }
  
  return courses;
};
```

---

## Conclusion

This comprehensive documentation provides a complete technical overview of the TVM Academy Education Management System. The system architecture follows modern web development practices with clear separation of concerns, robust security measures, and scalable design patterns.

### Key Achievements:
1. **Scalable Architecture**: Three-tier architecture supporting growth
2. **Security First**: JWT authentication, input validation, and data protection
3. **Modern Tech Stack**: React.js frontend with Node.js/Express backend
4. **Comprehensive Documentation**: Detailed diagrams and API specifications
5. **Production Ready**: Deployment and monitoring strategies included

This documentation serves as a complete guide for development, deployment, and maintenance of the TVM Academy system, ensuring long-term sustainability and scalability.
