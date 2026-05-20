import Event from '../models/Event.js';
import Vote from '../models/Vote.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';

// AI-powered election summary
export const generateElectionSummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId)
      .populate('candidates')
      .populate('participants');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const votes = await Vote.find({ eventId });
    const totalVotes = votes.length;
    
    // Calculate statistics
    const candidateStats = await Promise.all(
      event.candidates.map(async (candidate) => {
        const candidateVotes = await Vote.countDocuments({ candidateId: candidate._id });
        const percentage = totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0;
        return {
          name: candidate.name,
          votes: candidateVotes,
          percentage: percentage.toFixed(2)
        };
      })
    );

    // Find winner
    const sortedCandidates = candidateStats.sort((a, b) => b.votes - a.votes);
    const winner = sortedCandidates[0];
    const isTie = sortedCandidates.filter(c => c.votes === winner.votes).length > 1;

    // Generate AI summary
    const summary = {
      eventTitle: event.title,
      totalParticipants: event.participants.length,
      totalVotes,
      participationRate: event.participants.length > 0 
        ? ((totalVotes / event.participants.length) * 100).toFixed(2) 
        : 0,
      winner: isTie ? 'Tie' : winner.name,
      winnerVotes: winner.votes,
      winnerPercentage: winner.percentage,
      candidateResults: candidateStats,
      insights: [
        `Total participation: ${event.participants.length} users joined the event`,
        `Voter turnout: ${((totalVotes / event.participants.length) * 100).toFixed(2)}%`,
        isTie ? 'The election resulted in a tie' : `${winner.name} won with ${winner.percentage}% of votes`,
        `Total votes cast: ${totalVotes}`
      ]
    };

    res.json(summary);
  } catch (error) {
    console.error('AI summary generation error:', error);
    res.status(500).json({ message: 'Failed to generate AI summary' });
  }
};

// AI fraud detection
export const detectFraud = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const votes = await Vote.find({ eventId }).populate('userId');
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const suspiciousActivity = [];
    const userVoteCounts = {};
    
    // Check for duplicate votes from same user
    votes.forEach(vote => {
      const userId = vote.userId?._id?.toString();
      if (userId) {
        userVoteCounts[userId] = (userVoteCounts[userId] || 0) + 1;
        if (userVoteCounts[userId] > 1) {
          suspiciousActivity.push({
            type: 'multiple_votes',
            userId,
            voteCount: userVoteCounts[userId]
          });
        }
      }
    });

    // Check for rapid voting (potential bot activity)
    const voteTimestamps = votes.map(v => v.timestamp).sort((a, b) => a - b);
    for (let i = 1; i < voteTimestamps.length; i++) {
      const timeDiff = voteTimestamps[i] - voteTimestamps[i - 1];
      if (timeDiff < 1000) { // Less than 1 second between votes
        suspiciousActivity.push({
          type: 'rapid_voting',
          timestamp: voteTimestamps[i],
          timeDifference: timeDiff
        });
      }
    }

    // Check for unusual voting patterns
    const hourlyDistribution = {};
    votes.forEach(vote => {
      const hour = vote.timestamp.getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    });

    const avgVotesPerHour = votes.length / 24;
    Object.entries(hourlyDistribution).forEach(([hour, count]) => {
      if (count > avgVotesPerHour * 5) { // More than 5x average
        suspiciousActivity.push({
          type: 'unusual_activity',
          hour: parseInt(hour),
          voteCount: count,
          average: avgVotesPerHour.toFixed(2)
        });
      }
    });

    const fraudScore = suspiciousActivity.length > 0 
      ? Math.min(100, suspiciousActivity.length * 10) 
      : 0;

    res.json({
      fraudScore,
      suspiciousActivity,
      totalVotes: votes.length,
      isSecure: fraudScore < 30
    });
  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({ message: 'Fraud detection failed' });
  }
};

// AI participation prediction
export const predictParticipation = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId).populate('participants');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const currentVotes = await Vote.countDocuments({ eventId });
    const totalParticipants = event.participants.length;
    
    // Calculate prediction based on current progress
    const eventDuration = event.endTime - event.startTime;
    const timeElapsed = Date.now() - event.startTime;
    const progress = Math.min(1, timeElapsed / eventDuration);
    
    // Simple linear prediction
    const predictedVotes = progress > 0 
      ? Math.round(currentVotes / progress)
      : totalParticipants;
    
    const predictedParticipationRate = totalParticipants > 0
      ? ((predictedVotes / totalParticipants) * 100).toFixed(2)
      : 0;

    res.json({
      currentVotes,
      totalParticipants,
      predictedVotes,
      predictedParticipationRate,
      confidence: (progress * 100).toFixed(2),
      recommendations: [
        predictedParticipationRate < 50 ? 'Send reminder notifications to boost participation' : 'Participation is on track',
        progress < 0.5 && currentVotes < totalParticipants * 0.3 ? 'Consider extending voting period' : 'Voting pace is normal'
      ]
    });
  } catch (error) {
    console.error('Participation prediction error:', error);
    res.status(500).json({ message: 'Prediction failed' });
  }
};
