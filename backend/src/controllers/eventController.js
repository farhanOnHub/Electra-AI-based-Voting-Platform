import Event from '../models/Event.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import crypto from 'crypto';

const generateEventCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, position, bio } = req.body;
    const banner = req.file ? `/uploads/events/${req.file.filename}` : req.body.banner;

    console.log('Creating event with data:', { title, description, startTime, endTime, position, bio });

    const event = new Event({
      title,
      description,
      startTime,
      endTime,
      banner,
      position,
      bio,
      organizer: req.userId,
      eventCode: generateEventCode(),
      status: 'upcoming'
    });

    // Get organizer name
    const organizer = await User.findById(req.userId);
    event.organizerName = organizer.name;

    await event.save();

    console.log('Event created with ID:', event._id);

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { status, search } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .populate('candidates')
      .sort({ createdAt: -1 });

    console.log('Found events:', events.length);
    events.forEach(event => {
      console.log('Event:', event._id.toString(), event.title);
    });

    // Convert ObjectIds to strings for JSON serialization
    const eventsWithStrings = events.map(event => ({
      ...event.toObject(),
      _id: event._id.toString(),
      organizer: event.organizer ? {
        ...event.organizer.toObject(),
        _id: event.organizer._id.toString()
      } : null,
      candidates: event.candidates.map(c => ({
        ...c.toObject(),
        _id: c._id.toString()
      }))
    }));

    res.json({ events: eventsWithStrings });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email organization')
      .populate('candidates')
      .populate('participants', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventByCode = async (req, res) => {
  try {
    const { eventCode } = req.body;

    const event = await Event.findOne({ eventCode: eventCode.toUpperCase() })
      .populate('organizer', 'name email organization')
      .populate('candidates');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, status, isResultsVisible, position, bio } = req.body;
    const banner = req.file ? `/uploads/events/${req.file.filename}` : req.body.banner;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(event, { title, description, startTime, endTime, status, isResultsVisible, banner, position, bio });
    await event.save();

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Candidate.deleteMany({ eventId: req.params.id });
    await Vote.deleteMany({ eventId: req.params.id });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinEvent = async (req, res) => {
  try {
    const { eventCode } = req.body;

    const event = await Event.findOne({ eventCode: eventCode.toUpperCase() });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(req.userId);

    // Check if already joined
    if (!event.participants.includes(req.userId)) {
      event.participants.push(req.userId);
      await event.save();
    }

    if (!user.joinedEvents.includes(event._id)) {
      user.joinedEvents.push(event._id);
      await user.save();
    }

    res.json({
      message: 'Joined event successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('joinedEvents').populate('votedEvents');

    console.log('User joinedEvents:', user.joinedEvents);
    console.log('User votedEvents:', user.votedEvents);

    // Convert ObjectIds to strings
    const joinedEventsWithStrings = (user.joinedEvents || []).map(event => ({
      ...event.toObject(),
      _id: event._id.toString()
    }));

    const votedEventsWithStrings = (user.votedEvents || []).map(event => ({
      ...event.toObject(),
      _id: event._id.toString()
    }));

    res.json({
      joinedEvents: joinedEventsWithStrings,
      votedEvents: votedEventsWithStrings
    });
  } catch (error) {
    console.error('Error in getUserEvents:', error);
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

    const votes = await Vote.find({ eventId }).populate('candidateId');

    const results = {};
    event.candidates.forEach(candidate => {
      const candidateVotes = votes.filter(v => v.candidateId._id.toString() === candidate._id.toString());
      results[candidate._id] = {
        candidateName: candidate.name,
        voteCount: candidateVotes.length,
        percentage: event.totalVotes > 0 ? ((candidateVotes.length / event.totalVotes) * 100).toFixed(2) : 0
      };
    });

    res.json({
      event,
      results,
      totalVotes: event.totalVotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.userId });

    const totalVotes = await Vote.countDocuments({ eventId: { $in: events.map(e => e._id) } });
    const totalParticipants = new Set();

    for (const event of events) {
      event.participants.forEach(p => totalParticipants.add(p.toString()));
    }

    res.json({
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'active').length,
      completedEvents: events.filter(e => e.status === 'completed').length,
      totalVotes,
      totalParticipants: totalParticipants.size
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
