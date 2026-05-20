import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const JoinEventPage = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const join = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await eventAPI.joinEvent(eventCode);
        setEvent(response.event);
        toast.success('Joined event successfully');
        // If event is active navigate to voting
        navigate(`/voting/${response.event._id}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to join event');
        setLoading(false);
      }
    };

    join();
  }, [eventCode, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full glass p-8 text-center">
        {!isAuthenticated ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Welcome to the Election</h2>
            <p className="text-dark-400 mb-6">Please log in or register to join and vote in this election.</p>
            <div className="flex justify-center gap-4">
              <Link to="/login" className="btn-primary">Log in</Link>
              <Link to="/register" className="btn-secondary">Register</Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-4">Unable to join</h2>
            <p className="text-dark-400">We couldn't join the event automatically. Try again from your dashboard or contact the organizer.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinEventPage;
