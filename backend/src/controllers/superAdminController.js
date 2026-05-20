import User from '../models/User.js';
import Event from '../models/Event.js';
import Organization from '../models/Organization.js';
import AuditLog from '../models/AuditLog.js';

export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalOrganizations = await Organization.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const suspiciousUsers = await User.countDocuments({ isSuspicious: true });

    res.json({
      totalUsers,
      totalEvents,
      totalOrganizations,
      activeUsers,
      bannedUsers,
      suspiciousUsers
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({ message: 'Failed to fetch platform stats' });
  }
};

export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find().populate('adminId');
    res.json(organizations);
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ message: 'Failed to fetch organizations' });
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

    // Log the action
    await AuditLog.create({
      action: 'USER_BANNED',
      userId: req.userId,
      targetUserId: userId,
      details: { reason }
    });

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Failed to ban user' });
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

    // Log the action
    await AuditLog.create({
      action: 'USER_UNBANNED',
      userId: req.userId,
      targetUserId: userId
    });

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ message: 'Failed to unban user' });
  }
};

export const getAllAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .populate('userId', 'name email')
      .populate('targetUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments();

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(health);
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ message: 'Failed to fetch system health' });
  }
};
