import mongoose from 'mongoose';
import crypto from 'crypto';

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Security tracking fields
  ipAddress: {
    type: String,
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  voteHash: {
    type: String,
    required: true
  },
  isSuspicious: {
    type: Boolean,
    default: false
  },
  suspicionReason: String
}, { timestamps: true });

// Compound index to prevent duplicate votes
voteSchema.index({ userId: 1, eventId: 1 }, { unique: true });
// Index for IP-based monitoring
voteSchema.index({ ipAddress: 1, eventId: 1 });
voteSchema.index({ deviceId: 1, eventId: 1 });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;
