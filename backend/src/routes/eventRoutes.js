import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as eventController from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for event banner uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/events');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Add additional security: validate filename to prevent path traversal
const secureUpload = (req, res, next) => {
  if (req.file) {
    const filename = req.file.filename;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
  }
  next();
};

const router = express.Router();

router.post('/', authenticate, authorize('admin'), upload.single('banner'), secureUpload, eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/code', eventController.getEventByCode);
router.put('/:id', authenticate, authorize('admin'), upload.single('banner'), secureUpload, eventController.updateEvent);
router.delete('/:id', authenticate, authorize('admin'), eventController.deleteEvent);
router.post('/join', authenticate, eventController.joinEvent);
router.get('/user/events', authenticate, eventController.getUserEvents);
router.get('/:eventId/results', eventController.getEventResults);
router.patch('/:eventId/toggle-results', authenticate, authorize('admin'), eventController.toggleResultsVisibility);
router.get('/admin/analytics', authenticate, authorize('admin'), eventController.getAdminAnalytics);

export default router;
