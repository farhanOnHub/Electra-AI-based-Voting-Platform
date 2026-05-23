import Vote from '../models/Vote.js';
import User from '../models/User.js';
import Event from '../models/Event.js';

export const getFraudAlerts = async (req, res) => {
  try {
    // Get suspicious votes
    const suspiciousVotes = await Vote.find({ isSuspicious: true })
      .populate('userId', 'name email')
      .populate('eventId', 'title eventCode')
      .populate('candidateId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get votes from same IP (potential duplicate voting)
    const ipGroups = await Vote.aggregate([
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          votes: { $push: '$$ROOT' }
        }
      },
      {
        $match: { count: { $gt: 2 } }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Get votes from same device
    const deviceGroups = await Vote.aggregate([
      {
        $group: {
          _id: '$deviceId',
          count: { $sum: 1 },
          votes: { $push: '$$ROOT' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 20
      }
    ]);

    res.json({
      suspiciousVotes,
      ipGroups,
      deviceGroups,
      totalSuspicious: suspiciousVotes.length,
      totalIPGroups: ipGroups.length,
      totalDeviceGroups: deviceGroups.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;

    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = true;
    user.banReason = reason;
    user.banDate = new Date();
    await user.save();

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = false;
    user.banReason = null;
    user.banDate = null;
    await user.save();

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const suspiciousVotes = await Vote.countDocuments({ isSuspicious: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const activeEvents = await Event.countDocuments({ status: 'active' });

    // Get recent activity
    const recentVotes = await Vote.find()
      .populate('userId', 'name')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalEvents,
      totalVotes,
      suspiciousVotes,
      bannedUsers,
      activeEvents,
      recentVotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
