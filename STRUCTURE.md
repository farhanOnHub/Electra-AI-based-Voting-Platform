# Electra - Project Structure Overview

Complete file structure and organization of the Electra voting platform.

## Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.js                 # Configuration management
│   │
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── eventController.js       # Event management
│   │   ├── candidateController.js   # Candidate management
│   │   ├── voteController.js        # Voting logic
│   │   └── notificationController.js # Notifications
│   │
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Event.js                 # Event schema
│   │   ├── Candidate.js             # Candidate schema
│   │   ├── Vote.js                  # Vote schema
│   │   └── Notification.js          # Notification schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── eventRoutes.js           # Event endpoints
│   │   ├── candidateRoutes.js       # Candidate endpoints
│   │   ├── voteRoutes.js            # Voting endpoints
│   │   └── notificationRoutes.js    # Notification endpoints
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   ├── errorHandler.js          # Error handling
│   │   └── validation.js            # Input validation
│   │
│   ├── sockets/
│   │   └── socketHandler.js         # Socket.IO real-time events
│   │
│   └── utils/
│       └── database.js              # Database connection
│
├── server.js                         # Express app setup
├── package.json                      # Dependencies
├── .env                              # Environment variables
├── .gitignore                        # Git ignore rules
└── README.md                         # Backend documentation
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Navigation component
│   │   ├── Footer.jsx               # Footer component
│   │   ├── ProtectedRoute.jsx       # Route protection
│   │   └── LoadingSpinner.jsx       # Loading indicator
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx          # Home page
│   │   ├── LoginPage.jsx            # Login page
│   │   ├── RegisterPage.jsx         # Registration page
│   │   ├── UserDashboard.jsx        # User dashboard
│   │   ├── VotingPage.jsx           # Voting interface
│   │   ├── ResultsPage.jsx          # Results display
│   │   └── AdminDashboard.jsx       # Admin panel
│   │
│   ├── context/
│   │   ├── AuthContext.jsx          # Authentication state
│   │   └── EventContext.jsx         # Event state
│   │
│   ├── utils/
│   │   └── api.js                   # API client setup
│   │
│   ├── styles/
│   │   └── globals.css              # Global styles
│   │
│   ├── App.jsx                      # Main app component
│   └── main.jsx                     # React entry point
│
├── public/                           # Static assets
├── index.html                        # HTML entry point
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── package.json                      # Dependencies
├── .env                              # Environment variables
├── .gitignore                        # Git ignore rules
└── README.md                         # Frontend documentation
```

## Root Level Files

```
Electra/
├── README.md                         # Main documentation
├── QUICKSTART.md                     # Quick start guide
├── DEPLOYMENT.md                     # Deployment guide
├── .gitignore                        # Git ignore (root)
├── LICENSE                           # MIT License
└── package.json                      # Root package (optional)
```

## Key Files Description

### Backend Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `server.js` | Main server entry | Express setup, Socket.IO, middleware |
| `config/index.js` | Configuration | Environment variables, constants |
| `models/*.js` | Database schemas | User, Event, Candidate, Vote, Notification |
| `controllers/*.js` | Business logic | API handlers, validations, responses |
| `routes/*.js` | API endpoints | URL paths and HTTP methods |
| `middleware/*.js` | Request handlers | Auth, errors, validation |
| `sockets/socketHandler.js` | Real-time events | Live voting updates, results |

### Frontend Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `App.jsx` | Main router | Route configuration, context providers |
| `pages/*.jsx` | Page components | Landing, auth, dashboard, voting, results |
| `components/*.jsx` | UI components | Navbar, footer, route protection |
| `context/*.jsx` | State management | Authentication, events state |
| `utils/api.js` | API client | Axios setup, API methods |
| `styles/globals.css` | Global styles | Tailwind, animations, utilities |
| `main.jsx` | React entry | Mounts React app to DOM |

## Environment Variables

### Backend `.env`
```
PORT                      # Server port
NODE_ENV                  # Environment (development/production)
MONGODB_URI              # MongoDB connection string
JWT_SECRET               # JWT signing key
JWT_REFRESH_SECRET       # Refresh token key
JWT_EXPIRATION           # Token expiration time
CLIENT_URL               # Frontend URL (for CORS)
SMTP_SERVICE             # Email service
SMTP_EMAIL               # Email account
SMTP_PASSWORD            # Email password
```

### Frontend `.env`
```
VITE_API_URL             # Backend API URL
VITE_SOCKET_URL          # WebSocket URL
```

## Database Schema

### User
- Basic info: name, email, password
- Role: user or admin
- Organization info
- Arrays: votedEvents, joinedEvents
- Timestamps

### Event
- Title, description, banner
- Organizer reference
- Event code, dates, status
- Candidates array
- Voting stats: totalVotes
- Participants array

### Candidate
- Name, image, bio, position
- Event reference
- Vote count

### Vote
- User, candidate, event references
- Timestamp
- Unique constraint: one vote per user per event

### Notification
- User reference
- Event reference
- Title, message, type
- Read status

## API Endpoints

### Authentication (11 endpoints)
- Register, Login, Profile, Update Profile
- Forgot Password, Reset Password

### Events (8 endpoints)
- CRUD operations, Join, Get user events
- Get results, Admin analytics

### Candidates (4 endpoints)
- Add, Update, Delete, Get by event

### Votes (4 endpoints)
- Cast vote, Get results, Check voted, History

### Notifications (5 endpoints)
- Create, Get, Mark read, Delete, Unread count

## Frontend Routes

```
/                      # Landing page
/login                 # Login page
/register              # Registration page
/dashboard             # User dashboard
/voting/:eventId       # Voting interface
/results/:eventId      # Results page
/admin                 # Admin dashboard
/admin/event/:id       # Event management
*                      # 404 redirect
```

## Data Flow

### Authentication Flow
1. User registers/logins → Backend validates → JWT generated
2. Token stored in localStorage → Sent with requests
3. ProtectedRoute checks token → Redirects if invalid

### Voting Flow
1. User joins event → Added to participants
2. Views candidates → Selects candidate
3. Confirms vote → POST to /api/votes
4. Backend validates → Stores vote → Updates counts
5. Socket.IO emits → Real-time update to all clients
6. Results update in real-time

### Event Management Flow
1. Admin creates event → Event code generated
2. Admin adds candidates → Stored in database
3. Users join with code → Added to event
4. Voting period starts → Results visible
5. Admin views analytics → Comprehensive stats

## Technologies Used

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT & bcryptjs
- Socket.IO
- Helmet, CORS, Rate Limiting

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router
- Framer Motion
- Recharts
- Axios
- react-hot-toast

### DevTools
- Nodemon (auto-reload)
- Postman (API testing)
- MongoDB Compass (DB GUI)
- VS Code Extensions

## Performance Optimization

### Backend
- Database indexes on frequently queried fields
- Connection pooling
- Response compression
- Caching strategy

### Frontend
- Code splitting with Vite
- Image optimization
- Lazy loading
- Production build minification

## Security Implementation

- JWT token validation
- bcrypt password hashing
- Input sanitization
- CORS protection
- Rate limiting
- Helmet security headers
- MongoDB query injection prevention
- XSS protection

## Scalability Architecture

- Stateless backend (horizontal scaling)
- Database replication ready
- Socket.IO namespace support
- Modular component structure
- Context API state management
- API client abstraction

---

This structure ensures clean separation of concerns, easy maintenance, and scalability.
