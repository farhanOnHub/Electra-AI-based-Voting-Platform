import Vote from '../models/Vote.js';
import Event from '../models/Event.js';

export const ensureAnonymousVoting = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If event doesn't allow anonymous voting, proceed normally
    if (!event.allowAnonymousVoting) {
      return next();
    }

    // For anonymous voting, we'll still track that a user voted
    // but won't expose their identity in results
    req.isAnonymousVoting = true;
    
    next();
  } catch (error) {
    console.error('Anonymous voting check error:', error);
    res.status(500).json({ message: 'Anonymous voting check failed' });
  }
};

export const anonymizeVoteResults = (votes) => {
  // Remove user information from vote results
  return votes.map(vote => ({
    candidateId: vote.candidateId,
    eventId: vote.eventId,
    timestamp: vote.timestamp,
    // Exclude userId for anonymous voting
  }));
};
