# Student Progress Management System

A comprehensive MERN stack application for tracking student progress on Codeforces with automated data synchronization and email notifications.

##Demo
Click===>>[Hereeee](https://student-progress-management-system-theta.vercel.app)

## Features

### 🎯 Core Functionality

- **Student Management**: Add, edit, delete students with complete profile information
- **Codeforces Integration**: Automatic data sync with Codeforces API
- **Progress Tracking**: Detailed contest history and problem-solving analytics
- **CSV Export**: Download student data in CSV format

### 📊 Analytics & Visualization

- **Contest History**: Rating progression graphs and contest performance
- **Problem Solving Data**: Statistics with filtering options (7, 30, 90 days)
- **Interactive Charts**: Rating distribution and submission trends
- **Submission Heatmap**: GitHub-style activity visualization

### ⚡ Automation

- **Scheduled Data Sync**: Configurable cron jobs for automatic updates
- **Inactivity Detection**: Automatic email reminders for inactive students
- **Real-time Updates**: Immediate sync when Codeforces handle is updated

### 🎨 User Experience

- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Dark/Light Mode**: Theme toggle with persistent preferences
- **Modern UI**: Clean interface with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback

## Tech Stack

### Frontend

- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Node-cron** for scheduled tasks
- **Nodemailer** for email functionality
- **Axios** for Codeforces API integration

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/vishnuu5/Student-Progress-Management-System.git
cd student-progress-management
```

### 2. Install Dependencies

```bash

# Install root dependencies

npm install

# Install all dependencies (frontend + backend)

npm run install-all
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/student-progress
PORT=5000
JWT_SECRET=your-jwt-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the required collections.

### 5. Start the Application

```bash

# Development mode (runs both frontend and backend)

npm run dev

# Or run separately:

# Backend only

npm run server

# Frontend only

npm run client
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Documentation

### Students API

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/export/csv` - Export students as CSV

### Codeforces API

- `GET /api/codeforces/contests/:studentId?days=365` - Get contest history
- `GET /api/codeforces/problems/:studentId?days=90` - Get problem solving data

### Settings API

- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings

## Configuration

### Cron Job Settings

Configure automatic data synchronization in the Settings page:

- **Default**: Daily at 2:00 AM
- **Custom**: Use cron expressions for specific schedules
- **Presets**: Common scheduling options available

### Email Configuration

Set up SMTP settings for automated reminder emails:

- Gmail, Outlook, or custom SMTP servers supported
- App passwords recommended for Gmail
- Configurable inactivity threshold

## Usage Guide

### Adding Students

1. Click "Add Student" button
2. Fill in required information:
   - Name, Email, Phone Number
   - Codeforces Handle (must be valid)
3. Enable/disable email reminders
4. Save - data will sync automatically

### Viewing Student Progress

1. Click "View Profile" (eye icon) in the students table
2. Navigate between "Contest History" and "Problem Solving Data" tabs
3. Use date filters to analyze specific periods
4. View interactive charts and submission heatmaps

### Managing Settings

1. Go to Settings page
2. Configure cron schedule for data synchronization
3. Set up email SMTP configuration
4. Adjust inactivity threshold for reminders

## Development

### Key Components

- **StudentsTable**: Main dashboard with student list
- **StudentProfile**: Detailed student view with tabs
- **ContestHistory**: Contest data with rating graphs
- **ProblemSolvingData**: Problem statistics and charts
- **SubmissionHeatmap**: GitHub-style activity visualization

### API Integration

- **Codeforces API**: Fetches user data, contests, and submissions
- **Rate Limiting**: Implements delays to respect API limits
- **Error Handling**: Graceful handling of API failures
- **Data Persistence**: Stores all data locally for offline access

## Deployment

### Production Build

```bash

# Build frontend

cd frontend
npm run build

# The built files will be in frontend/dist/

```

### Environment Variables

Set the following in production:

- `MONGODB_URI`: Production MongoDB connection string
- `PORT`: Server port (default: 5000)
- SMTP settings for email functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This application is designed for educational and management purposes. Please respect Codeforces API rate limits and terms of service.
