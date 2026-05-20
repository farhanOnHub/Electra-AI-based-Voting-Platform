import QRCode from 'qrcode';
import Event from '../models/Event.js';

export const generateEventQR = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Generate QR code URL for event joining
    const eventUrl = `${process.env.CLIENT_URL}/join/${event.eventCode}`;
    
    const qrCode = await QRCode.toDataURL(eventUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Save QR code to event
    event.qrCode = qrCode;
    await event.save();

    res.json({ 
      qrCode,
      eventUrl,
      eventCode: event.eventCode 
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
};

export const generateResultQR = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Generate public result URL
    const resultUrl = `${process.env.CLIENT_URL}/results/${event.publicResultsSlug || event._id}`;
    
    const qrCode = await QRCode.toDataURL(resultUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({ 
      qrCode,
      resultUrl 
    });
  } catch (error) {
    console.error('Result QR generation error:', error);
    res.status(500).json({ message: 'Failed to generate result QR code' });
  }
};
