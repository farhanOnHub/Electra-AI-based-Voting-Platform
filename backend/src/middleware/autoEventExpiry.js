import Event from '../models/Event.js';
import { initializeSocket } from '../sockets/socketHandler.js';

export const checkEventStatus = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Update events that should start
    await Event.updateMany(
      {
        startTime: { $lte: now },
        endTime: { $gt: now },
        status: 'upcoming',
        autoStartEvent: true
      },
      { status: 'active' }
    );

    // Update events that should end
    await Event.updateMany(
      {
        endTime: { $lte: now },
        status: 'active'
      },
      { status: 'completed' }
    );

    next();
  } catch (error) {
    console.error('Event status check error:', error);
    next();
  }
};

export const scheduleEventExpiry = () => {
  // Check event status every minute
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Find events that need status updates
      const eventsToStart = await Event.find({
        startTime: { $lte: now },
        endTime: { $gt: now },
        status: 'upcoming',
        autoStartEvent: true
      });

      const eventsToEnd = await Event.find({
        endTime: { $lte: now },
        status: 'active'
      });

      // Update events
      for (const event of eventsToStart) {
        event.status = 'active';
        await event.save();
        console.log(`Event "${event.title}" has started automatically`);
      }

      for (const event of eventsToEnd) {
        event.status = 'completed';
        await event.save();
        console.log(`Event "${event.title}" has ended automatically`);
      }
    } catch (error) {
      console.error('Scheduled event expiry check error:', error);
    }
  }, 60000); // Check every minute
};
