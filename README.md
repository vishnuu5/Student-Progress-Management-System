# Student Progress Management System

A comprehensive system for tracking and managing student progress in competitive programming, with a focus on Codeforces integration.

## Features

### Student Management
- View all students in a responsive table
- Add, edit, and delete student records
- Export student data to CSV
- Search and filter students by name, email, or Codeforces handle

### Codeforces Integration
- Automatic data synchronization with Codeforces
- Track contest participation and ratings
- Monitor problem-solving progress
- Analyze submission patterns and success rates

### Progress Tracking
- Real-time contest performance monitoring
- Problem-solving statistics and trends
- Rating progression visualization
- Inactivity detection and notifications

### System Settings
- Configurable data sync schedule (daily, weekly, monthly)
- Email notification settings
- SMTP configuration for automated emails
- Inactivity threshold customization

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- React Hot Toast for notifications
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Node-cron for scheduled tasks
- Nodemailer for email notifications
- Axios for external API calls

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Codeforces API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vishnuu5/Student-Progress-Management-System
cd student-progress-management
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Configure environment variables:
Create a `.env` file in the server directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=your_from_email
```

4. Start the development servers:
```bash
# Start backend server
cd server
npm run dev

# Start frontend server
cd ../client
npm run dev
```

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/export/csv` - Export students to CSV

### Codeforces
- `GET /api/codeforces/contests/:studentId` - Get student's contest history
- `GET /api/codeforces/problems/:studentId` - Get student's problem-solving data
- `POST /api/codeforces/sync/:studentId` - Sync student's Codeforces data

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings
- `PUT /api/settings/sync` - Update sync settings
- `PUT /api/settings/email` - Update email settings

### Contests
- `GET /api/contests/:studentId` - Get student's contests
- `GET /api/contests/stats/:studentId` - Get contest statistics

### Submissions
- `GET /api/submissions/:studentId` - Get student's submissions
- `GET /api/submissions/stats/:studentId` - Get submission statistics

## Data Models

### Student
```javascript
{
  name: String,
  email: String,
  codeforcesHandle: String,
  currentRating: Number,
  maxRating: Number,
  lastDataUpdate: Date,
  lastSubmissionDate: Date
}
```

### Contest
```javascript
{
  studentId: ObjectId,
  contestId: String,
  contestName: String,
  rank: Number,
  oldRating: Number,
  newRating: Number,
  ratingChange: Number,
  contestDate: Date,
  solvedProblems: [String],
  unsolvedProblems: [String],
  totalProblems: Number
}
```

### Submission
```javascript
{
  studentId: ObjectId,
  problemId: String,
  problemName: String,
  problemRating: Number,
  verdict: String,
  submissionTime: Date,
  programmingLanguage: String,
  executionTime: Number,
  memoryConsumed: Number,
  testCasesPassed: Number,
  totalTestCases: Number,
  isContestSubmission: Boolean,
  contestId: String
}
```

### Settings
```javascript
{
  syncTime: String,
  syncFrequency: String,
  emailSettings: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String,
    fromEmail: String
  },
  inactivityThreshold: Number,
  cronExpression: String,
  cronDescription: String
}
```

## Recent Updates

### Version 1.1.0
- Added comprehensive settings management
- Implemented configurable data sync schedule
- Added email notification system
- Enhanced error handling and validation
- Improved UI/UX with responsive design
- Added dark mode support

### Version 1.0.0
- Initial release with basic student management
- Codeforces integration
- Progress tracking features
- Basic reporting capabilities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Codeforces API for providing student data
- MongoDB for database management
- React and Node.js communities for excellent documentation
