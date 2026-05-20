import Candidate from '../models/Candidate.js';
import Event from '../models/Event.js';

export const addCandidate = async (req, res) => {
  try {
    const { eventId, name, image, bio, position } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const candidate = new Candidate({
      name,
      image,
      bio,
      position,
      eventId
    });

    await candidate.save();

    event.candidates.push(candidate._id);
    await event.save();

    res.status(201).json({
      message: 'Candidate added successfully',
      candidate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const { name, image, bio, position } = req.body;

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const event = await Event.findById(candidate.eventId);
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(candidate, { name, image, bio, position });
    await candidate.save();

    res.json({
      message: 'Candidate updated successfully',
      candidate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const event = await Event.findById(candidate.eventId);
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Candidate.findByIdAndDelete(req.params.id);
    event.candidates = event.candidates.filter(c => c.toString() !== req.params.id);
    await event.save();

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidatesByEvent = async (req, res) => {
  try {
    const candidates = await Candidate.find({ eventId: req.params.eventId });
    res.json({ candidates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
