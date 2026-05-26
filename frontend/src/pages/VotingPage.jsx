import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { eventAPI, candidateAPI, voteAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, Users, Clock, Shield, AlertTriangle, ArrowLeft, AlertCircle } from 'lucide-react';

export const VotingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceStatus, setFaceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showVoteConfirmation, setShowVoteConfirmation] = useState(false);

  useEffect(() => {
    if (!eventId) {
      toast.error('Invalid event ID');
      navigate('/dashboard');
      return;
    }

    // Check if user is returning from verification
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setFaceVerified(true);
      toast.success('Face verified successfully');
      // Remove the query param from URL
      navigate(`/voting/${eventId}`, { replace: true });
    }

    loadEventData();
    // initialize socket for live updates
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_event', eventId);
    });

    socket.on('vote_update', (data) => {
      if (data.eventId !== eventId) return;
      // update candidate counts and total votes
      setCandidates(prev => prev.map(c => c._id === data.candidateId ? { ...c, voteCount: data.voteCount } : c));
      setEvent(prev => prev ? { ...prev, totalVotes: data.totalVotes } : prev);
    });

    socket.on('final_results', (payload) => {
      if (payload.eventId !== eventId) return;
      // set final totals
      setEvent(prev => prev ? { ...prev, totalVotes: payload.totalVotes, status: 'completed' } : prev);
      // update candidate vote counts from payload.results if available
      if (payload.results) {
        setCandidates(prev => prev.map(c => {
          const r = payload.results.find(rr => rr.candidateId === c._id || rr.candidateId === String(c._id));
          return r ? { ...c, voteCount: r.voteCount } : c;
        }));
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_event', eventId);
        socketRef.current.disconnect();
      }
    };
  }, [eventId]);

  // Countdown timer effect
  useEffect(() => {
    if (!event || !event.endTime) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(event.endTime);
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        return;
      }

      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [event]);

  const loadEventData = async () => {
    try {
      const eventResponse = await eventAPI.getEventById(eventId);
      setEvent(eventResponse.event);

      const candidatesResponse = await candidateAPI.getCandidatesByEvent(eventId);
      setCandidates(candidatesResponse.candidates || []);

      const voteStatus = await voteAPI.checkIfVoted(eventId);
      setHasVoted(voteStatus.hasVoted);

      try {
        const faceStatus = await faceVerificationAPI.checkFaceVerification();
        setFaceVerified(faceStatus.faceVerified);
        setFaceStatus(faceStatus);
      } catch (faceError) {
        // Face verification is optional, don't fail on error
        setFaceVerified(false);
        setFaceStatus(null);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error(error.response?.data?.message || 'Failed to load event');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }

    // Show confirmation dialog
    setShowVoteConfirmation(true);
  };

  const confirmVote = async () => {
    setShowVoteConfirmation(false);

    // Face verification check - now using live camera verification
    if (!faceVerified) {
      toast.error('Please verify your identity using the camera before voting.');
      return;
    }

    try {
      await voteAPI.castVote({
        candidateId: selectedCandidate._id,
        eventId
      });

      toast.success('Vote cast successfully!');
      setHasVoted(true);
      setShowConfirmation(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      if (error.response?.data?.code === 'ACCOUNT_TOO_NEW') {
        toast.error(error.response.data.message, { duration: 5000 });
      } else {
        toast.error(error.response?.data?.message || 'Failed to cast vote');
      }
    }
  };

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return '00:00:00';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-dark-400 mb-4">Event not found</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isActive = now >= new Date(event.startTime) && now <= new Date(event.endTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Success Message */}
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-8 flex items-center gap-3"
          >
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <h3 className="font-semibold text-green-400">Vote Submitted Successfully!</h3>
              <p className="text-green-300 text-sm">Thank you for participating. Redirecting...</p>
            </div>
          </motion.div>
        )}

        {/* Event Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 mb-8 rounded-2xl"
        >
          {event.banner && (
            <img
              src={event.banner.startsWith('http') ? event.banner : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${event.banner}`}
              alt={event.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
              loading="eager"
            />
          )}

          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <p className="text-dark-300 mb-6">{event.description}</p>

          {/* Countdown Timer - Displayed prominently when voting is active */}
          {isActive && timeRemaining !== null && timeRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-2 border-primary-500/50 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center justify-center gap-4">
                <Clock className="text-primary-400" size={32} />
                <div className="text-center">
                  <p className="text-primary-300 text-sm font-medium mb-1">Time Remaining</p>
                  <p className="text-4xl font-bold text-white tracking-wider">
                    {formatTimeRemaining(timeRemaining)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-dark-400">Status</p>
              <p className={`font-semibold ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-dark-400">Total Votes</p>
              <p className="font-semibold text-primary-400">{event.totalVotes}</p>
            </div>
            <div>
              <p className="text-dark-400">Participants</p>
              <p className="font-semibold text-primary-400">{event.participants?.length || 0}</p>
            </div>
          </div>
          {event.maxVotes && (
            <div className="mt-4 bg-white/5 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <p className="text-dark-400">Votes Remaining</p>
                <p className="font-semibold text-primary-400">{event.maxVotes - event.totalVotes} / {event.maxVotes}</p>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${((event.totalVotes / event.maxVotes) * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          )}
          {faceStatus && (
            <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-dark-400">Identity Confidence</p>
                <p className="font-semibold text-primary-400">{faceStatus.identityConfidence ?? 'N/A'}%</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-dark-400">Liveness Score</p>
                <p className="font-semibold text-primary-400">{faceStatus.livenessScore ?? 'N/A'}%</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-dark-400">Biometric Status</p>
                <p className={`font-semibold ${faceStatus.biometricAnomaly ? 'text-red-400' : 'text-green-400'}`}>
                  {faceStatus.biometricAnomaly ? 'Anomaly detected' : 'Secure'}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Status Alert */}
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-8 flex items-center gap-3"
          >
            <AlertCircle className="text-blue-400" size={24} />
            <p className="text-blue-300">You have already voted in this event</p>
          </motion.div>
        )}


        {!isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8 flex items-center gap-3"
          >
            <AlertCircle className="text-red-400" size={24} />
            <p className="text-red-300">This event is not active for voting</p>
          </motion.div>
        )}

        {/* Candidates Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Select a Candidate</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, idx) => (
              <motion.button
                key={candidate._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedCandidate(candidate)}
                disabled={hasVoted}
                className={`glass p-6 text-left rounded-xl transition-all transform hover:scale-105 ${
                  selectedCandidate?._id === candidate._id
                    ? 'ring-2 ring-primary-500 bg-primary-500/10'
                    : ''
                } ${hasVoted ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {candidate.image && (
                  <img
                    src={candidate.image.startsWith('http') ? candidate.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${candidate.image}`}
                    alt={candidate.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    loading="eager"
                  />
                )}
                
                <h3 className="text-lg font-semibold mb-1">{candidate.name}</h3>
                {candidate.position && (
                  <p className="text-primary-400 text-sm mb-3">{candidate.position}</p>
                )}
                <p className="text-dark-300 text-sm mb-4">{candidate.bio}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-dark-400">Votes: {candidate.voteCount}</span>
                  {selectedCandidate?._id === candidate._id && !hasVoted && (
                    <CheckCircle className="text-primary-400" size={20} />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Vote Button */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          {selectedCandidate && !faceVerified && !hasVoted && isActive && (
            <button
              onClick={() => navigate(`/face-verification/${eventId}`)}
              className="btn-primary flex-1"
            >
              Verify Yourself
            </button>
          )}
          {faceVerified && selectedCandidate && !hasVoted && isActive && (
            <button
              onClick={() => setShowConfirmation(false) || (selectedCandidate ? handleVote() : toast.error('Select a candidate'))}
              className="btn-primary flex-1"
            >
              Confirm Vote
            </button>
          )}
          {hasVoted && (
            <button
              disabled
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Already Voted
            </button>
          )}
        </div>
      </div>

      {/* Vote Confirmation Modal */}
      {showVoteConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVoteConfirmation(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-8 rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <Shield className="text-primary-400 mx-auto mb-4" size={48} />
              <h2 className="text-2xl font-bold mb-2">Confirm Your Vote</h2>
              <p className="text-dark-300">You are about to vote for:</p>
              <p className="text-xl font-semibold text-primary-400 mt-2">{selectedCandidate?.name}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-dark-300">Identity verification required</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-dark-300">Account age check (10 min minimum)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-dark-300">Duplicate vote prevention</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-dark-300">Device fingerprinting active</span>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 text-sm">
                <AlertTriangle className="inline mr-2" size={16} />
                This action cannot be undone. Your vote will be permanently recorded.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVoteConfirmation(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                className="btn-primary flex-1"
              >
                Confirm & Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
