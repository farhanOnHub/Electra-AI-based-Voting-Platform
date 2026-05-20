import mongoose from 'mongoose';
import crypto from 'crypto';

const voteBlockchainSchema = new mongoose.Schema({
  voteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vote',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  voteHash: {
    type: String,
    unique: true,
    required: true
  },
  previousHash: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  faceVerificationImage: String, // Encrypted image hash
  faceVerified: {
    type: Boolean,
    default: false
  },
  verificationTimestamp: Date,
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  tamperDetected: {
    type: Boolean,
    default: false
  }
}, { timestamps: false });

// Generate vote hash
voteBlockchainSchema.pre('save', function(next) {
  if (!this.voteHash) {
    const voteData = `${this.eventId}-${this.candidateId}-${this.timestamp}-${Math.random()}`;
    this.voteHash = crypto.createHash('sha256').update(voteData).digest('hex');
  }
  next();
});

const VoteBlockchain = mongoose.model('VoteBlockchain', voteBlockchainSchema);

export default VoteBlockchain;
