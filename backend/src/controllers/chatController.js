import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

export const sendMessage = async (req, res) => {
  try {
    const { eventId, message } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const chatMessage = new ChatMessage({
      eventId,
      userId,
      userName: user.name,
      userAvatar: user.profileImage,
      message
    });

    await chatMessage.save();

    // Emit to socket
    req.io.to(`event_${eventId}`).emit('new_message', {
      _id: chatMessage._id,
      userName: user.name,
      userAvatar: user.profileImage,
      message,
      createdAt: chatMessage.createdAt,
      likes: 0
    });

    res.status(201).json({
      message: 'Message sent',
      chatMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ eventId, isModerated: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ eventId, isModerated: false });

    res.json({
      messages: messages.reverse(),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Toggle like
    if (chatMessage.likes.includes(userId)) {
      chatMessage.likes = chatMessage.likes.filter(id => !id.equals(userId));
    } else {
      chatMessage.likes.push(userId);
    }

    await chatMessage.save();

    res.json({
      message: 'Like updated',
      likesCount: chatMessage.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const flagMessage = async (req, res) => {
  try {
    const { messageId, reason } = req.body;

    const chatMessage = await ChatMessage.findByIdAndUpdate(
      messageId,
      { isFlagged: true, flagReason: reason },
      { new: true }
    );

    res.json({
      message: 'Message flagged for moderation',
      chatMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only message author or admin can delete
    if (!chatMessage.userId.equals(userId) && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await ChatMessage.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moderateMessage = async (req, res) => {
  try {
    const { messageId, moderate } = req.body;

    const chatMessage = await ChatMessage.findByIdAndUpdate(
      messageId,
      { isModerated: moderate },
      { new: true }
    );

    res.json({
      message: `Message ${moderate ? 'hidden' : 'restored'}`,
      chatMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
