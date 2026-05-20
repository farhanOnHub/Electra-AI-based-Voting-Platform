import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  logo: String,
  theme: {
    primaryColor: { type: String, default: '#0ea5e9' },
    secondaryColor: { type: String, default: '#0369a1' }
  },
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allowedDomains: [{
    domain: String,
    verified: { type: Boolean, default: false }
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  settings: {
    anonymousVoting: { type: Boolean, default: true },
    requireFaceVerification: { type: Boolean, default: false },
    publicResults: { type: Boolean, default: true },
    autoStartEvent: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
