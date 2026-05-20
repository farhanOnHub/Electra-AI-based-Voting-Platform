import Notification from '../models/Notification.js';

export const createNotification = async (req, res) => {
  try {
    const { userId, eventId, title, message, type } = req.body;

    const notification = new Notification({
      userId,
      eventId,
      title,
      message,
      type
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification created',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const notifications = await Notification.find({ userId })
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const count = await Notification.countDocuments({ userId, isRead: false });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
