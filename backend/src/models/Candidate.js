import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  voteCount: {
    type: Number,
    default: 0
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

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate;
