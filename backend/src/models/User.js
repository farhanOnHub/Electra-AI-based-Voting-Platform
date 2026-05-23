import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  organizationName: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Face Verification
  faceVerificationImage: String, // Encrypted hash of face
  faceVerified: {
    type: Boolean,
    default: false
  },
  faceVerificationDate: Date,
  faceLivenessScore: {
    type: Number,
    default: 0
  },
  identityConfidence: {
    type: Number,
    default: 0
  },
  biometricAnomaly: {
    type: Boolean,
    default: false
  },
  lastFaceVerificationAttempt: Date,
  
  // Account Status
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  banDate: Date,
  isSuspicious: {
    type: Boolean,
    default: false
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lastLoginAttempt: Date,
  
  votedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  joinedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  
  // Anonymous Mode Preferences
  preferAnonymousVoting: {
    type: Boolean,
    default: false
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

// Database indexes for performance optimization
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ organizationId: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ isBanned: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
