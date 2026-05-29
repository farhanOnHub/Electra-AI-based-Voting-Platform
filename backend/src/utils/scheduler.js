import Event from '../models/Event.js';
import Vote from '../models/Vote.js';
import mongoose from 'mongoose';
import { deleteCachePattern } from './cache.js';

const DEFAULT_INTERVAL_MS = 30 * 1000; // 30 seconds

export const startEventScheduler = (io, intervalMs = DEFAULT_INTERVAL_MS) => {
  console.log('Starting event scheduler, interval:', intervalMs);

  const tick = async () => {
    try {
      // Check if database is connected
      if (mongoose.connection.readyState !== 1) {
        // Database not connected, skip this tick
        return;
      }

      const now = new Date();

      // Activate upcoming events whose startTime <= now
      const toStart = await Event.find({ status: 'upcoming', autoStartEvent: true, startTime: { $lte: now } });
      for (const ev of toStart) {
        ev.status = 'active';
        await ev.save();
        console.log(`Event ${ev._id} started by scheduler`);
        try {
          io.to(`event_${ev._id}`).emit('event_status_changed', { eventId: ev._id, status: 'active', timestamp: new Date() });
        } catch (emitErr) {
          console.error('Socket emit error on start:', emitErr);
        }
      }

      // Close active events whose endTime <= now
      const toClose = await Event.find({ status: 'active', endTime: { $lte: now } }).populate('candidates');
      for (const ev of toClose) {
        // Tally final votes
        const votes = await Vote.find({ eventId: ev._id }).populate('candidateId');
        const results = ev.candidates.map(candidate => {
          const candidateVotes = votes.filter(v => v.candidateId && v.candidateId._id.toString() === candidate._id.toString());
          return {
            candidateId: candidate._id,
            candidateName: candidate.name,
            voteCount: candidateVotes.length
          };
        });

        ev.totalVotes = votes.length;
        ev.status = 'completed';
        // Optionally make results visible when event completes
        ev.isResultsVisible = ev.isResultsVisible || true;
        await ev.save();

        console.log(`Event ${ev._id} closed by scheduler`);

        try {
          io.to(`event_${ev._id}`).emit('event_status_changed', { eventId: ev._id, status: 'completed', timestamp: new Date() });
          io.to(`event_${ev._id}`).emit('final_results', { eventId: ev._id, results, totalVotes: ev.totalVotes });
        } catch (emitErr) {
          console.error('Socket emit error on close:', emitErr);
        }
      }

      if (toStart.length > 0 || toClose.length > 0) {
        await deleteCachePattern('events:');
      }
    } catch (error) {
      console.error('Scheduler tick error:', error);
    }
  };

  // Run immediately then on interval
  tick();
  const id = setInterval(tick, intervalMs);

  return () => clearInterval(id);
};

export default startEventScheduler;
