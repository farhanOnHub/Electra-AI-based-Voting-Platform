import Vote from '../models/Vote.js';
import Event from '../models/Event.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import { generateDeviceFingerprint, generateVoteHash, isAccountOldEnough, detectSuspiciousActivity } from '../utils/deviceFingerprint.js';

export const castVote = async (req, res) => {
  try {
    const { candidateId, eventId } = req.body;
    const userId = req.userId;

    // Get user details for security checks
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Account age restriction - prevent instant fake accounts
    if (!isAccountOldEnough(user.createdAt, 10)) {
      const remainingMinutes = Math.ceil((10 * 60 * 1000 - (Date.now() - new Date(user.createdAt).getTime())) / (60 * 1000));
      return res.status(403).json({
        message: `Account must be at least 10 minutes old before voting. Please wait ${remainingMinutes} more minutes.`,
        code: 'ACCOUNT_TOO_NEW'
      });
    }

    // Verify event exists and is active
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if maxVotes is set and reached
    if (event.maxVotes && event.totalVotes >= event.maxVotes) {
      return res.status(400).json({ message: 'Maximum votes reached for this event' });
    }

    // Check if user has already voted in this event
    const existingVote = await Vote.findOne({ userId, eventId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this event' });
    }

    // Generate device fingerprint and security data
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const deviceId = generateDeviceFingerprint(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const timestamp = Date.now();
    const voteHash = generateVoteHash(userId, candidateId, eventId, timestamp);

    // Detect suspicious activity
    const suspiciousPatterns = await detectSuspiciousActivity(Vote, eventId, ipAddress, deviceId);
    const isSuspicious = suspiciousPatterns.length > 0;

    const now = new Date();
    if (now < new Date(event.startTime) || now > new Date(event.endTime)) {
      return res.status(400).json({ message: 'Voting is not active for this event' });
    }

    // Verify candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Create vote with security tracking
    const vote = new Vote({
      userId,
      candidateId,
      eventId,
      ipAddress,
      deviceId,
      userAgent,
      voteHash,
      isSuspicious,
      suspicionReason: isSuspicious ? suspiciousPatterns.join(', ') : null
    });

    await vote.save();

    // Update candidate vote count
    candidate.voteCount += 1;
    await candidate.save();

    // Update event total votes
    event.totalVotes += 1;
    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
    }
    await event.save();

    // Add to user's votedEvents
    if (!user.votedEvents.includes(eventId)) {
      user.votedEvents.push(eventId);
      await user.save();
    }

    // Emit real-time update via Socket.IO if available
    try {
      const io = req.io;
      const candidateLatest = await Candidate.findById(candidateId);
      if (io) {
        io.to(`event_${eventId}`).emit('vote_update', {
          eventId,
          candidateId: candidateId,
          candidateName: candidateLatest.name,
          voteCount: candidateLatest.voteCount,
          totalVotes: event.totalVotes
        });
      }
    } catch (emitErr) {
      console.error('Error emitting vote update:', emitErr);
    }

    res.status(201).json({
      message: 'Vote cast successfully',
      vote
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventResults = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate('candidates');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const votes = await Vote.find({ eventId });

    const results = event.candidates.map(candidate => {
      const candidateVotes = votes.filter(v => v.candidateId.toString() === candidate._id.toString());
      return {
        candidateId: candidate._id,
        candidateName: candidate.name,
        image: candidate.image,
        bio: candidate.bio,
        voteCount: candidateVotes.length,
        percentage: event.totalVotes > 0 ? ((candidateVotes.length / event.totalVotes) * 100).toFixed(2) : 0
      };
    }).sort((a, b) => b.voteCount - a.voteCount);

    res.json({
      event,
      results,
      totalVotes: event.totalVotes,
      winner: results[0] || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkIfVoted = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    const vote = await Vote.findOne({ userId, eventId });

    res.json({
      hasVoted: !!vote,
      vote: vote || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserVotingHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const votes = await Vote.find({ userId })
      .populate('eventId', 'title eventCode startTime endTime')
      .populate('candidateId', 'name image');

    res.json({ votes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
