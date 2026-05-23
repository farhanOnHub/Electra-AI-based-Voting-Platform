import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  banner: {
    type: String,
    default: null
  },
  position: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  organizerName: String,
  candidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }],
  eventCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },
  isResultsVisible: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowAnonymousVoting: {
    type: Boolean,
    default: true
  },
  requireFaceVerification: {
    type: Boolean,
    default: false
  },
  autoStartEvent: {
    type: Boolean,
    default: true
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxParticipants: {
    type: Number,
    default: null
  },
  maxVotes: {
    type: Number,
    default: null
  },
  
  // Advanced Features
  allowChat: {
    type: Boolean,
    default: true
  },
  qrCode: String,
  publicResultsSlug: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Database indexes for performance optimization
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startTime: 1, endTime: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ isPublic: 1, status: 1 });
eventSchema.index({ organizationId: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
