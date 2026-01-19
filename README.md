# TVM Academy - Backend API

Backend REST API for TVM Academy Education Management System built with Node.js, Express, and MongoDB.

## Features

🔐 **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin/User)
- Email OTP verification system
- Password reset functionality

📊 **Admin Reporting System**
- Dashboard statistics with real-time data
- Monthly enrollment reports with detailed breakdown
- Yearly overview and trend analysis
- Course-wise performance metrics
- Revenue tracking and analytics

📚 **Course Management**
- CRUD operations for courses
- Course categorization and pricing
- Enrollment tracking
- Course status management

👥 **User Management**
- User registration and login
- Profile management
- Email verification
- Admin user creation

📝 **Enquiry System**
- Contact form handling
- Enquiry status tracking
- Admin enquiry management

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Nodemailer** - Email functionality

## API Endpoints

### Authentication
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
POST /api/auth/send-otp     - Send OTP for verification
POST /api/auth/verify-otp   - Verify OTP
```

### Courses
```
GET    /api/courses         - Get all courses
POST   /api/courses         - Create course (Admin)
GET    /api/courses/:id     - Get course by ID
PUT    /api/courses/:id     - Update course (Admin)
DELETE /api/courses/:id     - Delete course (Admin)
```

### Reports (Admin Only)
```
GET /api/reports/dashboard-stats      - Dashboard statistics
GET /api/reports/monthly-enrollment   - Monthly enrollment report
GET /api/reports/yearly-overview      - Yearly overview report
GET /api/reports/test                 - API connectivity test
```

### Enquiries
```
GET  /api/enquiries         - Get all enquiries (Admin)
POST /api/enquiries         - Submit enquiry
PUT  /api/enquiries/:id     - Update enquiry status (Admin)
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/Santhosh-Sks/Tvm-Academy-backend.git
cd Tvm-Academy-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tvm-academy
JWT_SECRET=your-super-secret-jwt-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
OTP_EXPIRY_MINUTES=5
```

### 4. Database Setup
Ensure MongoDB is running, then create admin user:
```bash
node reset-admin-password.js
```

### 5. Create Sample Data (Optional)
```bash
node create-sample-data.js
```

### 6. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on http://localhost:5000

## Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/user),
  isEmailVerified: Boolean,
  createdAt: Date
}
```

### Course Schema
```javascript
{
  title: String,
  description: String,
  instructor: String,
  duration: String,
  level: String (beginner/intermediate/advanced),
  price: Number,
  category: String,
  status: String (active/inactive)
}
```

### Enrollment Schema
```javascript
{
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  enrollmentDate: Date,
  paymentAmount: Number,
  paymentStatus: String,
  paymentMethod: String,
  transactionId: String,
  status: String
}
```

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - Request data validation
- **Error Handling** - Comprehensive error responses
- **Environment Variables** - Sensitive data protection

## Reports System

### Dashboard Stats
- Current month enrollments and revenue
- Growth percentage compared to last month
- Total courses, students, and pending enquiries

### Monthly Reports
- Detailed enrollment breakdown by month/year
- Course-wise statistics and revenue
- Daily enrollment trends
- Summary metrics

### Yearly Overview
- Annual enrollment trends
- Monthly breakdown for the year
- Most popular courses
- Revenue analysis

## Scripts

```bash
npm start              # Start production server
npm run dev           # Start development server with nodemon
node reset-admin-password.js    # Reset/create admin user
node create-sample-data.js      # Create sample data for testing
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/tvm-academy` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email username | `your-email@gmail.com` |
| `EMAIL_APP_PASSWORD` | Email app password | `your-app-password` |
| `OTP_EXPIRY_MINUTES` | OTP expiry time | `5` |

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

All errors return JSON with `success: false` and error message.

## Development

### Project Structure
```
├── config/
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── enquiryController.js
│   └── reportsController.js
├── middleware/
│   ├── auth.js
│   └── adminOnly.js
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Enrollment.js
│   └── Enquiry.js
├── routes/
│   ├── auth.js
│   ├── courses.js
│   ├── enquiries.js
│   └── reports.js
├── server.js
└── package.json
```

### Adding New Features
1. Create model in `models/`
2. Add controller in `controllers/`
3. Create routes in `routes/`
4. Add middleware if needed
5. Update server.js to include routes

## Testing

### Manual Testing
Use tools like Postman or curl to test endpoints.

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@tvm.ac.in", "password": "admin123"}'
```

### Test Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/reports/dashboard-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment

### Production Checklist
- [ ] Set strong `JWT_SECRET`
- [ ] Configure production MongoDB
- [ ] Set up environment variables
- [ ] Configure email settings
- [ ] Update CORS for production domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring and logging

### Deployment Options
- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS EC2** - Full control with custom setup
- **DigitalOcean** - Cost-effective VPS hosting
- **Vercel** - Serverless deployment

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create GitHub issue with detailed description
- Include error logs and environment details
- Check existing issues for solutions

## Author

**Santhosh** - [Santhosh-Sks](https://github.com/Santhosh-Sks)
