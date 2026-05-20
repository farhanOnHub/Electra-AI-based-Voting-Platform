import mongoose from 'mongoose';
import crypto from 'crypto';

const publicResultSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  shareToken: {
    type: String,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  allowSharing: {
    type: Boolean,
    default: true
  },
  allowDownload: {
    type: Boolean,
    default: true
  },
  downloadFormats: {
    pdf: { type: Boolean, default: true },
    csv: { type: Boolean, default: true },
    json: { type: Boolean, default: true }
  },
  viewCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  qrCode: String,
  customMessage: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, { timestamps: true });

const PublicResult = mongoose.model('PublicResult', publicResultSchema);

export default PublicResult;
