import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './src/config/index.js';
import { connectDB, isDBConnected } from './src/utils/database.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { initializeSocket } from './src/sockets/socketHandler.js';
import { startEventScheduler } from './src/utils/scheduler.js';
import adminRoutes from './src/routes/adminRoutes.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import candidateRoutes from './src/routes/candidateRoutes.js';
import voteRoutes from './src/routes/voteRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import qrRoutes from './src/routes/qrRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import superAdminRoutes from './src/routes/superAdminRoutes.js';
import mlRoutes from './src/routes/mlRoutes.js';
import organizationRoutes from './src/routes/organizationRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import faceVerificationRoutes from './src/routes/faceVerificationRoutes.js';
import otpRoutes from './src/routes/otpRoutes.js';
import publicResultsRoutes from './src/routes/publicResultsRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App setup
const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// DB connect
connectDB();

// Middlewares
app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    config.clientUrl
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach socket
initializeSocket(io);

// Scheduler
startEventScheduler(io);

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server running',
    database: isDBConnected() ? 'connected' : 'not connected',
    timestamp: new Date()
  });
});

// Block API if DB not connected
app.use('/api', (req, res, next) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      message: 'Database not connected'
    });
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/face-verification', faceVerificationRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/public-results', publicResultsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/admin', adminRoutes);

/* =========================
   FRONTEND SERVE (FIXED)
========================= */

if (config.nodeEnv === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');

  app.use(express.static(frontendPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server (IMPORTANT for Render)
const PORT = process.env.PORT || config.port || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});