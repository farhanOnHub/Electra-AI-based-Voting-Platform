import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  action: {
    type: String,
    enum: [
      'login', 'logout', 'register', 'password_reset',
      'event_created', 'event_updated', 'event_deleted',
      'vote_cast', 'candidate_added', 'candidate_removed',
      'user_banned', 'failed_login', 'face_verification_attempt',
      'admin_activity', 'organization_created'
    ],
    required: true
  },
  resource: {
    type: String,
    description: 'What was affected (event, user, etc)'
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Create compound index for queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
