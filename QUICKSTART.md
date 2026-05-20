# Electra - Quick Start Guide

Get Electra running locally in just a few minutes!

## Prerequisites

Before you start, make sure you have:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier available)
- Code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Clone or Download the Project

```bash
# Clone from GitHub
git clone https://github.com/your-username/Electra.git
cd Electra
```

Or download the ZIP file and extract it.

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project
4. Create a cluster (select Free tier)
5. Create a database user:
   - Username: `admin`
   - Password: Create a strong password
6. Add current IP to whitelist
7. Click "Connect" → "Connect your application"
8. Copy the connection string
   - Format: `mongodb+srv://admin:password@cluster.mongodb.net/electra`

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
# For Windows (Command Prompt)
copy .env .env

# For macOS/Linux
cp .env .env
```

**Edit `.env` file with your settings:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/electra
JWT_SECRET=your-super-secret-key-make-it-random
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRATION=24h
CLIENT_URL=http://localhost:3000
SMTP_SERVICE=gmail
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Start Backend Server:**

```bash
# Development with auto-reload
npm run dev

# Or production mode
npm start
```

Expected output:
```
Server running on port 5000
MongoDB connected successfully
```

✅ Backend is now running at `http://localhost:5000`

### 4. Frontend Setup

**In a new terminal window:**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
# For Windows
copy .env .env

# For macOS/Linux
cp .env .env
```

**Edit `.env` file:**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Start Frontend Server:**

```bash
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

✅ Frontend is now running at `http://localhost:3000`

## Access the Application

Open your browser and go to:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

## Create Your First Account

1. Go to `http://localhost:3000`
2. Click "Register"
3. Fill in the form:
   - **Full Name:** Your Name
   - **Email:** your@email.com
   - **Organization:** Your College/Organization
   - **Password:** Create a password (min 6 characters)
   - **Role:** Select "Event Organizer" (Admin) or "Regular User"
4. Click "Create Account"

## Testing Features

### Test as Admin (Event Organizer)

1. Register with role: "Event Organizer"
2. Login to account
3. Click "Admin Panel" in navigation
4. Create your first event:
   - Title: "Class President Election"
   - Description: "Vote for your class president"
   - Start Time: Pick a time in the future
   - End Time: Pick a time after start time
5. Add candidates:
   - Go to event management
   - Add 3-4 candidates with names
6. Wait for event to start (or change server time)
7. View live results

### Test as User

1. Open a new browser or incognito window
2. Register as "Regular User"
3. Get event code from admin (shown in admin panel)
4. Join event using the code
5. Vote for a candidate
6. View results in real-time

## Useful Commands

### Backend

```bash
cd backend

# Development with hot reload
npm run dev

# Production build
npm start

# Install new package
npm install package-name

# Remove package
npm uninstall package-name
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Install new package
npm install package-name
```

## Debugging

### Enable Debug Mode

Add this to `.env`:
```env
DEBUG=*
```

### Check API Connection

```bash
# In backend directory
curl http://localhost:5000/api/health
```

### Browser Developer Tools

Press `F12` to open developer tools:
- **Console:** Check for JavaScript errors
- **Network:** See API requests and responses
- **Storage:** View localStorage (JWT token)

## Common Issues

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Check MongoDB connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure MongoDB is running

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### API Not Responding

**Check:**
1. Backend is running (`npm run dev`)
2. Correct API URL in frontend `.env`
3. No CORS errors in console
4. Network connection is working

### Cannot Join Event

**Check:**
1. Event code is correct (case-sensitive)
2. Event has been started
3. User is authenticated (token in storage)
4. Event has not ended

## Next Steps

1. ✅ Read full [README.md](./README.md)
2. ✅ Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production
3. ✅ Explore the API documentation
4. ✅ Customize the UI with your branding
5. ✅ Add more features
6. ✅ Deploy to production

## File Structure Reference

```
Electra/
├── backend/
│   ├── src/
│   │   ├── config/        # App configuration
│   │   ├── controllers/   # API logic
│   │   ├── models/        # Database schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth, errors, etc
│   │   ├── sockets/       # Real-time events
│   │   └── utils/         # Helper functions
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env               # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # State management
│   │   ├── utils/         # API, helpers
│   │   ├── styles/        # CSS files
│   │   ├── App.jsx        # Main app
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env               # Frontend config
│
├── README.md              # Full documentation
└── DEPLOYMENT.md          # Deployment guide
```

## Performance Tips

1. **Backend:**
   - Enable caching for frequently accessed data
   - Use database indexes properly
   - Monitor response times
   - Implement rate limiting

2. **Frontend:**
   - Optimize images before uploading
   - Use React DevTools for profiling
   - Minimize bundle size
   - Enable lazy loading

## Security Tips

1. Change all default passwords
2. Use strong JWT secrets (32+ characters)
3. Enable HTTPS in production
4. Keep dependencies updated
5. Review MongoDB permissions
6. Enable email verification
7. Implement rate limiting
8. Validate all user inputs

## Get Help

- Check console for error messages
- Review API response in Network tab
- Check MongoDB Atlas logs
- Read the full documentation
- Check GitHub Issues
- Ask on Stack Overflow

## Shortcuts

- Backend health: `http://localhost:5000/api/health`
- MongoDB Compass: View local database GUI
- Postman: Test APIs without frontend
- VS Code Extensions:
  - MongoDB for VS Code
  - Thunder Client (API testing)
  - ES7+ React snippets

## What's Next?

After everything is working:
1. Add more features
2. Customize branding
3. Add SMS notifications
4. Integrate email service
5. Add QR code scanning
6. Deploy to production
7. Set up monitoring
8. Scale the application

---

🎉 Congratulations! Electra is now running locally!

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)
