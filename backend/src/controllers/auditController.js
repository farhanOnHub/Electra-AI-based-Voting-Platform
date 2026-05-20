import AuditLog from '../models/AuditLog.js';

export const logActivity = async (data) => {
  try {
    const auditLog = new AuditLog(data);
    await auditLog.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { userId, action, startDate, endDate, page = 1, limit = 50 } = req.query;

    let filter = {};
    
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFailedLogins = async (req, res) => {
  try {
    const failedLogins = await AuditLog.find({
      action: 'failed_login',
      status: 'failure',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ timestamp: -1 });

    res.json({ failedLogins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuspiciousActivities = async (req, res) => {
  try {
    const suspiciousActivities = await AuditLog.find({
      severity: { $in: ['high', 'critical'] },
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ timestamp: -1 });

    res.json({ suspiciousActivities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserActivityHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;

    const activities = await AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
