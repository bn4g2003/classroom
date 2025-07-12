# Classroom Management App

A real-time classroom management tool that enables instructors to efficiently manage students, assign lessons, and communicate via live chat.

## Features

### 🔐 Authentication
- SMS-based authentication using Twilio
- Email-based authentication for students
- JWT token-based secure sessions
- Role-based access control (Instructor/Student)

### 👥 Instructor Features
- Add/Edit/Delete students
- Assign lessons to students
- View student progress
- Real-time chat with students
- Dashboard with student overview

### 🎓 Student Features
- View assigned lessons
- Mark lessons as completed
- Edit personal profile
- Real-time chat with instructor
- Progress tracking

### 💬 Real-time Features
- Socket.io powered live chat
- Instant notifications
- Real-time updates across devices

## Tech Stack

### Backend
- **Node.js** with Express
- **Firebase Firestore** for database
- **Twilio** for SMS authentication
- **Nodemailer** for email services
- **Socket.io** for real-time communication
- **JWT** for authentication

### Frontend
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time features
- Responsive design for all devices

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Firebase project with Firestore enabled
- Twilio account for SMS
- Gmail account for email services

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file with the following variables:
   ```env
   PORT=8080
   
   # Firebase Configuration (Base64 encoded service account JSON)
   FIREBASE_SERVICE_ACCOUNT_BASE64=your_firebase_service_account_base64
   
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Start the backend server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:3000`

## Usage Guide

### For Instructors

1. **Registration:**
   - Go to the homepage
   - Click "Sign up as Instructor"
   - Fill in your details and register

2. **Login:**
   - Use phone number to receive SMS code
   - Or use email to receive email code
   - Enter the 6-digit verification code

3. **Managing Students:**
   - Access the "Manage Students" section
   - Add new students with name, phone, and email
   - Students will receive welcome emails with login instructions
   - Edit or delete existing students

4. **Assigning Lessons:**
   - Go to "Manage Lessons"
   - Select a student and create lesson with title and description
   - Students will see assigned lessons in their dashboard

### For Students

1. **Login:**
   - Students use email-based authentication
   - Enter email to receive 6-digit code
   - Verify code to access dashboard

2. **Managing Lessons:**
   - View all assigned lessons in "My Lessons"
   - Read lesson descriptions and requirements
   - Mark lessons as completed when done

3. **Profile Management:**
   - Update name and email in "My Profile"
   - Phone number cannot be changed (used for identification)

## API Endpoints

### Authentication Routes
- `POST /api/auth/createAccessCode` - Generate SMS access code
- `POST /api/auth/validateAccessCode` - Validate SMS access code
- `POST /api/auth/loginEmail` - Generate email access code
- `POST /api/auth/validateEmailCode` - Validate email access code

### Instructor Routes (Protected)
- `POST /api/instructor/addInstructor` - Register new instructor (public)
- `POST /api/instructor/addStudent` - Add new student
- `POST /api/instructor/assignLesson` - Assign lesson to student
- `GET /api/instructor/students` - Get all students
- `GET /api/instructor/student/:phone` - Get specific student
- `PUT /api/instructor/editStudent/:phone` - Update student
- `DELETE /api/instructor/student/:phone` - Delete student

### Student Routes (Protected)
- `GET /api/student/myLessons` - Get assigned lessons
- `POST /api/student/markLessonDone` - Mark lesson as completed
- `PUT /api/student/editProfile` - Update student profile

## File Structure

```
classroom/
├── backend/
│   ├── config/
│   │   ├── firebase.js          # Firebase configuration
│   │   └── nodemailer.js        # Email configuration
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── instructor.controller.js # Instructor features
│   │   └── student.controller.js    # Student features
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── instructor.routes.js # Instructor endpoints
│   │   └── student.routes.js    # Student endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── server.js                # Main server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── login/           # Login pages
    │   │   ├── register/        # Registration pages
    │   │   ├── dashboard/       # Dashboard pages
    │   │   ├── layout.tsx       # Root layout
    │   │   └── page.tsx         # Homepage
    │   └── components/          # Reusable components
    └── package.json
```

## Security Features

- JWT token-based authentication
- Protected routes with middleware
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Code expiration (10 minutes)
- Role-based access control


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


