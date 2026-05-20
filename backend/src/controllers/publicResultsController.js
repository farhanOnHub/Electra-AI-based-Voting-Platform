import PublicResult from '../models/PublicResult.js';
import Event from '../models/Event.js';
import Vote from '../models/Vote.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

export const generatePublicResult = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create slug from event title
    const slug = event.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const publicResult = new PublicResult({
      eventId,
      slug: `${slug}-${Date.now()}`
    });

    // Generate QR code
    const resultUrl = `${process.env.FRONTEND_URL}/results/${publicResult.slug}`;
    publicResult.qrCode = await QRCode.toDataURL(resultUrl);

    await publicResult.save();

    res.status(201).json({
      message: 'Public result created',
      publicResult,
      shareUrl: resultUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicResults = async (req, res) => {
  try {
    const { slug } = req.params;

    const publicResult = await PublicResult.findOne({ slug, isPublished: true })
      .populate('eventId');

    if (!publicResult) {
      return res.status(404).json({ message: 'Results not found' });
    }

    // Increment view count
    publicResult.viewCount += 1;
    await publicResult.save();

    // Get vote results
    const event = publicResult.eventId;
    const votes = await Vote.find({ eventId: event._id }).populate('candidateId');

    const results = {};
    event.candidates.forEach(candidateId => {
      const candidateVotes = votes.filter(v => v.candidateId._id.toString() === candidateId.toString());
      results[candidateId] = {
        voteCount: candidateVotes.length,
        percentage: event.totalVotes > 0 ? ((candidateVotes.length / event.totalVotes) * 100).toFixed(2) : 0
      };
    });

    res.json({
      event: {
        title: event.title,
        description: event.description,
        banner: event.banner,
        endTime: event.endTime
      },
      results,
      totalVotes: event.totalVotes,
      customMessage: publicResult.customMessage,
      viewCount: publicResult.viewCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateQRCode = async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // QR code for joining event
    const joinUrl = `${process.env.FRONTEND_URL}/join/${event.eventCode}`;
    const qrCode = await QRCode.toDataURL(joinUrl);

    res.json({
      qrCode,
      url: joinUrl,
      eventCode: event.eventCode
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sharePublicResult = async (req, res) => {
  try {
    const { slug } = req.params;

    const publicResult = await PublicResult.findOne({ slug });
    if (!publicResult) {
      return res.status(404).json({ message: 'Result not found' });
    }

    publicResult.shareCount += 1;
    await publicResult.save();

    res.json({
      message: 'Result shared',
      shareCount: publicResult.shareCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportResults = async (req, res) => {
  try {
    const { eventId, format } = req.body;

    const event = await Event.findById(eventId).populate('candidates');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const votes = await Vote.find({ eventId });

    const results = event.candidates.map(candidate => ({
      name: candidate.name,
      voteCount: votes.filter(v => v.candidateId.toString() === candidate._id.toString()).length,
      percentage: event.totalVotes > 0 ? 
        ((votes.filter(v => v.candidateId.toString() === candidate._id.toString()).length / event.totalVotes) * 100).toFixed(2) : 
        0
    }));

    if (format === 'csv') {
      const csv = 'Candidate,Votes,Percentage\n' + 
        results.map(r => `"${r.name}",${r.voteCount},${r.percentage}%`).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="results-${eventId}.csv"`);
      res.send(csv);
    } else if (format === 'json') {
      res.json({
        event: {
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime
        },
        results,
        totalVotes: event.totalVotes,
        exportedAt: new Date()
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
