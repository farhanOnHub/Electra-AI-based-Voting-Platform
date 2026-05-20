import Event from '../models/Event.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import Organization from '../models/Organization.js';

export const getPlatformAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isBanned: false });
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'active' });
    const totalVotes = await Vote.countDocuments();
    const totalOrganizations = await Organization.countDocuments();

    // Participation rate
    const usersWhoVoted = await User.distinct('_id', { votedEvents: { $exists: true, $ne: [] } });
    const participationRate = totalUsers > 0 ? (usersWhoVoted.length / totalUsers) * 100 : 0;

    // Voting trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const votesLast7Days = await Vote.find({
      timestamp: { $gte: sevenDaysAgo }
    });

    const dailyVotes = {};
    votesLast7Days.forEach(vote => {
      const date = vote.timestamp.toISOString().split('T')[0];
      dailyVotes[date] = (dailyVotes[date] || 0) + 1;
    });

    // Peak voting hours
    const hourlyVotes = {};
    votesLast7Days.forEach(vote => {
      const hour = vote.timestamp.getHours();
      hourlyVotes[hour] = (hourlyVotes[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourlyVotes).sort((a, b) => b[1] - a[1])[0];

    res.json({
      totalUsers,
      totalEvents,
      activeEvents,
      totalVotes,
      totalOrganizations,
      participationRate: participationRate.toFixed(2),
      dailyVotes,
      peakVotingHour: peakHour ? { hour: parseInt(peakHour[0]), votes: peakHour[1] } : null
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

export const getEventAnalytics = async (req, res) => {
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

    // Candidate performance
    const candidatePerformance = await Promise.all(
      event.candidates.map(async (candidate) => {
        const candidateVotes = await Vote.countDocuments({ candidateId: candidate._id });
        const percentage = totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0;
        return {
          candidateId: candidate._id,
          name: candidate.name,
          votes: candidateVotes,
          percentage: percentage.toFixed(2)
        };
      })
    );

    // Voting timeline
    const voteTimeline = {};
    votes.forEach(vote => {
      const date = vote.timestamp.toISOString().split('T')[0];
      voteTimeline[date] = (voteTimeline[date] || 0) + 1;
    });

    res.json({
      event: {
        title: event.title,
        status: event.status,
        totalParticipants: event.participants.length,
        totalVotes
      },
      candidatePerformance,
      voteTimeline
    });
  } catch (error) {
    console.error('Event analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch event analytics' });
  }
};

export const getOrganizationAnalytics = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const users = await User.countDocuments({ organizationId });
    const events = await Event.countDocuments({ organizationId });
    const votes = await Vote.find({ eventId: { $in: await Event.find({ organizationId }).distinct('_id') } });

    res.json({
      organization: {
        name: organization.name,
        totalUsers: users,
        totalEvents: events,
        totalVotes: votes.length
      }
    });
  } catch (error) {
    console.error('Organization analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch organization analytics' });
  }
};
