# Electra - Secure Online Voting Platform

A modern, secure, and scalable full-stack voting platform designed for colleges, communities, organizations, and events.

## 🌟 Features

### Core Features
- ✅ **Secure Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **Real-time Voting** - Socket.IO for live vote updates
- ✅ **One Vote per User** - Duplicate vote prevention with database indexing
- ✅ **Event Management** - Create, edit, and delete voting events
- ✅ **Candidate Management** - Add candidates with images and descriptions
- ✅ **Live Results** - Real-time result charts and analytics
- ✅ **User Dashboard** - Join events, track voting history
- ✅ **Admin Dashboard** - Manage events and view analytics
- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern UI** - Dark theme with glassmorphism effects

### Advanced Features
- Role-based access control (Admin/User)
- Event codes for easy joining
- Comprehensive analytics
- Notification system
- Password reset functionality
- Email verification
- Deployment-ready architecture

## 🛠 Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- Socket.IO client for real-time updates
- Framer Motion for animations
- Recharts for analytics
- React Hot Toast for notifications

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Socket.IO for real-time features
- Helmet for security
- CORS for cross-origin requests
- Rate limiting for protection

### Database
- MongoDB Atlas (Cloud)
- Mongoose ODM

## 📁 Project Structure

```
Electra/
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context
│   │   ├── utils/             # Utility functions & API
│   │   ├── styles/            # Global styles
│   │   └── App.jsx            # Main app component
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── backend/
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── sockets/           # Socket.IO handlers
│   │   └── utils/             # Utility functions
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env                   # Environment variables
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/electra
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-key
JWT_EXPIRATION=24h
CLIENT_URL=http://localhost:3000
SMTP_SERVICE=gmail
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

4. Start the backend:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Event Endpoints
- `POST /api/events` - Create event (Admin)
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)
- `POST /api/events/code` - Join event by code
- `GET /api/events/user/events` - Get user's events
- `GET /api/events/:eventId/results` - Get event results

### Vote Endpoints
- `POST /api/votes` - Cast vote
- `GET /api/votes/:eventId/results` - Get voting results
- `GET /api/votes/:eventId/check` - Check if user voted
- `GET /api/votes/history` - Get voting history

### Candidate Endpoints
- `POST /api/candidates` - Add candidate (Admin)
- `PUT /api/candidates/:id` - Update candidate (Admin)
- `DELETE /api/candidates/:id` - Delete candidate (Admin)
- `GET /api/candidates/event/:eventId` - Get candidates

## 🔐 Security Features

- JWT token-based authentication
- bcrypt password hashing
- One vote per user enforcement
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet.js security headers
- MongoDB injection prevention
- XSS protection

## 🌐 Deployment

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Connect Vercel to GitHub repository
3. Set environment variables
4. Deploy automatically

### Backend Deployment (Render)
1. Push code to GitHub
2. Create new service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Add to `.env` file

## 📊 Database Models

### User
```javascript
{
  name, email, password, role,
  organization, profileImage,
  isEmailVerified, votedEvents, joinedEvents,
  createdAt, updatedAt
}
```

### Event
```javascript
{
  title, description, banner, organizer,
  candidates, eventCode, startTime, endTime,
  status, isResultsVisible, totalVotes,
  participants, maxParticipants
}
```

### Candidate
```javascript
{
  name, image, bio, position,
  eventId, voteCount
}
```

### Vote
```javascript
{
  userId, candidateId, eventId, timestamp
}
```

## 🎯 Usage

### For Users
1. Register account
2. Login to dashboard
3. Join event using event code
4. Select candidate and vote
5. View results in real-time
6. Track voting history

### For Admins
1. Register as event organizer
2. Create voting events
3. Add candidates with details
4. Set voting start/end times
5. Monitor live voting
6. View analytics

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with clear messages
5. Push to the branch
6. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, email: support@electra.com

## 🙏 Acknowledgments

- React.js community
- Node.js ecosystem
- MongoDB documentation
- Tailwind CSS team
- All contributors

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] AI-powered analytics
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Video streaming
- [ ] Blockchain integration
- [ ] 2FA authentication
- [ ] Custom themes

---

Made with ❤️ for secure voting worldwide
