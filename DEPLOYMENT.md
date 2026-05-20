# Electra - Deployment Guide

This guide covers deploying Electra to production using Vercel (Frontend) and Render (Backend).

## Prerequisites

- GitHub account with the Electra repository
- MongoDB Atlas account
- Vercel account
- Render account

## Backend Deployment (Render)

### Step 1: Prepare Backend Code

1. Ensure all changes are committed and pushed to GitHub:
```bash
cd backend
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

2. Update `.env` for production in Render dashboard (not in code)

### Step 2: Deploy to Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Fill in the details:
   - **Name:** electra-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. Set environment variables:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_strong_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRATION=24h
CLIENT_URL=https://your-frontend-url.vercel.app
SMTP_SERVICE=gmail
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Note the backend URL (e.g., `https://electra-backend.onrender.com`)

### Step 3: Update package.json

In `backend/package.json`, update the start script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Code

1. Update `frontend/.env.production`:
```
VITE_API_URL=https://electra-backend.onrender.com/api
VITE_SOCKET_URL=https://electra-backend.onrender.com
```

2. Push to GitHub:
```bash
cd frontend
git add .
git commit -m "Prepare frontend for production"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click "Add New" and select "Project"
3. Import your GitHub repository
4. Select the `frontend` directory as the root
5. Configure build settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. Set environment variables:
```
VITE_API_URL=https://electra-backend.onrender.com/api
VITE_SOCKET_URL=https://electra-backend.onrender.com
```

7. Click "Deploy"
8. Wait for deployment to complete
9. Note the frontend URL

### Step 3: Update Backend CORS

Go back to Render dashboard for backend:
1. Update `CLIENT_URL` environment variable with your Vercel frontend URL
2. Redeploy the backend

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project
3. Create a cluster (free tier available)
4. Create a database user with strong password
5. Add IP address to whitelist (allow 0.0.0.0 for all IPs)
6. Copy connection string

### Step 2: Format Connection String

Replace placeholders in the connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/electra?retryWrites=true&w=majority
```

## Domain Setup

### Custom Domain on Vercel

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate will be auto-generated

### Custom Domain on Render

1. In Render dashboard, go to Custom Domain
2. Add your custom domain
3. Update DNS records

## Monitoring & Logging

### Vercel

- View logs in deployment dashboard
- Check real-time logs in Analytics tab

### Render

- View logs in Render dashboard
- Access application logs for debugging

## Performance Optimization

### Frontend

1. Enable gzip compression (automatic on Vercel)
2. Optimize images
3. Code splitting (automatic with Vite)
4. Use CDN for assets

### Backend

1. Enable response compression
2. Database indexing for queries
3. Connection pooling for MongoDB
4. Cache frequently accessed data

## Security Checklist

- [ ] Environment variables not exposed
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] MongoDB user with limited permissions
- [ ] JWT secrets are strong and unique
- [ ] Password requirements enforced
- [ ] Input validation on all endpoints

## Troubleshooting

### Backend not connecting to MongoDB

1. Check connection string is correct
2. Verify IP whitelist in MongoDB Atlas
3. Check database user credentials
4. Test connection locally first

### Frontend not loading

1. Check API URL in environment variables
2. Verify backend CORS settings
3. Clear browser cache
4. Check browser console for errors

### Real-time updates not working

1. Verify Socket.IO configuration
2. Check WebSocket is not blocked
3. Enable WebSocket support on hosting
4. Check firewall rules

### CORS errors

1. Verify CLIENT_URL matches frontend URL
2. Update CORS origin in backend
3. Check Render/Vercel domain configuration
4. Restart backend service

## Performance Monitoring

### Key Metrics to Monitor

1. **Response Time:** Should be < 200ms
2. **Error Rate:** Should be < 1%
3. **Uptime:** Should be > 99.5%
4. **Database Latency:** Should be < 50ms

Use services like:
- [Uptime Robot](https://uptimerobot.com) - Uptime monitoring
- [LogRocket](https://logrocket.com) - Error tracking
- [New Relic](https://newrelic.com) - Performance monitoring

## Scaling

### Horizontal Scaling

- Use Render's auto-scaling
- Load balancing on Vercel (automatic)
- Database read replicas on MongoDB Atlas

### Vertical Scaling

- Upgrade Render dyno type
- Increase MongoDB resources
- Upgrade Vercel plan

## Backup Strategy

1. **Database:** Enable MongoDB Atlas automatic backups
2. **Code:** Use GitHub for version control
3. **Secrets:** Store securely in dashboard
4. **Regular:** Daily backups recommended

## CI/CD Pipeline

Both Vercel and Render support automatic deployment on push:

1. Push code to GitHub
2. Automatic tests run
3. Deployment triggered
4. Live updates within minutes

## Post-Deployment

1. Test all features thoroughly
2. Monitor error logs
3. Set up monitoring alerts
4. Create backups
5. Document any issues
6. Plan regular maintenance

## Support & Help

- Check Render documentation
- Check Vercel documentation
- Review MongoDB Atlas guide
- Contact support teams for platform-specific issues

---

For more help, visit the [Electra GitHub Issues](https://github.com/your-username/Electra/issues)
