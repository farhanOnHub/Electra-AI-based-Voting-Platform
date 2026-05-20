import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String,
  userAvatar: String,
  message: {
    type: String,
    required: true
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
