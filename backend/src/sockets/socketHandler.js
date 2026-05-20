import Vote from '../models/Vote.js';
import Event from '../models/Event.js';
import Candidate from '../models/Candidate.js';

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Join event room
    socket.on('join_event', (eventId) => {
      socket.join(`event_${eventId}`);
      console.log(`User ${socket.id} joined event ${eventId}`);
    });

    // Leave event room
    socket.on('leave_event', (eventId) => {
      socket.leave(`event_${eventId}`);
      console.log(`User ${socket.id} left event ${eventId}`);
    });

    // Vote cast notification
    socket.on('vote_cast', async (data) => {
      try {
        const { eventId, candidateId, candidateName, voteCount } = data;

        // Broadcast vote update to all users in event room
        io.to(`event_${eventId}`).emit('vote_update', {
          candidateId,
          candidateName,
          voteCount,
          timestamp: new Date()
        });

        console.log(`Vote cast in event ${eventId} for candidate ${candidateName}`);
      } catch (error) {
        console.error('Error in vote_cast:', error);
      }
    });

    // Get live results
    socket.on('get_live_results', async (eventId) => {
      try {
        const event = await Event.findById(eventId).populate('candidates');
        const votes = await Vote.find({ eventId });

        const results = event.candidates.map(candidate => {
          const candidateVotes = votes.filter(v => v.candidateId.toString() === candidate._id.toString());
          return {
            candidateId: candidate._id,
            candidateName: candidate.name,
            voteCount: candidateVotes.length,
            percentage: event.totalVotes > 0 ? ((candidateVotes.length / event.totalVotes) * 100).toFixed(2) : 0
          };
        });

        socket.emit('live_results', {
          eventId,
          results,
          totalVotes: event.totalVotes
        });
      } catch (error) {
        console.error('Error getting live results:', error);
      }
    });

    // Event status update
    socket.on('event_status_update', (data) => {
      const { eventId, status } = data;
      io.to(`event_${eventId}`).emit('event_status_changed', {
        eventId,
        status,
        timestamp: new Date()
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
