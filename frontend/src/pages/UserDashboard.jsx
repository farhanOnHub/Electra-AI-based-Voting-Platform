import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { eventAPI, voteAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Users, CheckCircle, Lock, Search, Plus, Code } from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('joined');
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [votedEvents, setVotedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventCode, setEventCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await eventAPI.getUserEvents();
      console.log('User events response:', response);
      setJoinedEvents(response.joinedEvents || []);
      setVotedEvents(response.votedEvents || []);

      const allEventsResponse = await eventAPI.getEvents();
      console.log('All events response:', allEventsResponse);
      setAllEvents(allEventsResponse.events || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (e) => {
    e.preventDefault();
    try {
      const event = await eventAPI.getEventByCode(eventCode);
      if (!joinedEvents.some(e => e._id === event._id)) {
        setJoinedEvents([...joinedEvents, event]);
        toast.success('Successfully joined event!');
        setEventCode('');
      } else {
        toast.error('Already joined this event');
      }
    } catch (error) {
      toast.error('Event not found or invalid code');
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    
    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'Active';
  };

  const EventCard = ({ event, onVote }) => {
    const status = getEventStatus(event);
    const hasVoted = votedEvents.some(v => v._id === event._id);

    console.log('EventCard rendering:', event._id, event.title);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {event.banner && (
          <img src={event.banner} alt={event.title} className="w-full h-32 object-cover rounded-lg mb-4" />
        )}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'Active' ? 'bg-green-500/20 text-green-400' :
            status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {status}
          </span>
        </div>
        <p className="text-dark-300 text-sm mb-4">{event.description}</p>

        <div className="space-y-2 mb-4 text-sm text-dark-400">
          <p className="flex items-center gap-2">
            <Users size={16} /> {event.participants?.length || 0} participants
          </p>
          <p className="flex items-center gap-2">
            <Calendar size={16} /> {new Date(event.startTime).toLocaleDateString()}
          </p>
        </div>

        {hasVoted && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" />
            <span className="text-green-400 text-sm">You have voted</span>
          </div>
        )}

        {status === 'Active' && !hasVoted && (
          <button
            onClick={() => {
              console.log('Vote Now clicked for event:', event._id, event.title);
              if (!event._id) {
                console.error('Event ID is undefined');
                toast.error('Invalid event ID');
                return;
              }
              onVote(event._id);
            }}
            className="btn-primary w-full"
          >
            Vote Now
          </button>
        )}

        {status !== 'Active' && (
          <button className="btn-secondary w-full opacity-50 cursor-not-allowed">
            {status === 'Upcoming' ? 'Vote When Active' : 'Voting Closed'}
          </button>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-dark-300">Manage your voting events and participation</p>
        </motion.div>

        {/* Join Event Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Code size={24} />
            Join an Event
          </h2>
          <form onSubmit={handleJoinEvent} className="flex gap-4">
            <input
              type="text"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.toUpperCase())}
              placeholder="Enter event code (e.g., ABC123)"
              className="input-field flex-1"
              maxLength="6"
            />
            <button type="submit" className="btn-primary px-6">
              Join Event
            </button>
          </form>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'joined', label: 'Joined Events', count: joinedEvents.length },
            { id: 'voted', label: 'Voted Events', count: votedEvents.length },
            { id: 'available', label: 'Available Events', count: allEvents.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-dark-600/50 px-2 py-1 rounded text-xs">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        {activeTab !== 'voted' && (
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-dark-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                placeholder="Search events..."
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'joined' && (
            joinedEvents.length > 0 ? (
              joinedEvents.map(event => (
                <EventCard
                  key={event._id || event.eventCode}
                  event={event}
                  onVote={(eventId) => {
                    if (!eventId) {
                      toast.error('Invalid event ID');
                      return;
                    }
                    window.location.href = `/voting/${eventId}`;
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-dark-400 mb-4">No joined events yet</p>
                <p className="text-dark-500 text-sm">Join an event using the code above to get started</p>
              </div>
            )
          )}

          {activeTab === 'voted' && (
            votedEvents.length > 0 ? (
              votedEvents.map(event => (
                <EventCard key={event._id} event={event} onVote={() => {}} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-dark-400 mb-4">You haven't voted yet</p>
                <p className="text-dark-500 text-sm">Join events and cast your vote</p>
              </div>
            )
          )}

          {activeTab === 'available' && (
            allEvents
              .filter(event => !joinedEvents.some(e => e._id === event._id) && event.title.toLowerCase().includes(searchQuery))
              .map(event => {
                console.log('Available event:', event._id, event.title);
                return (
                  <EventCard
                    key={event._id || event.eventCode}
                    event={event}
                    onVote={(eventId) => {
                      console.log('Vote clicked for available event:', eventId);
                      if (!eventId) {
                        toast.error('Invalid event ID');
                        return;
                      }
                      window.location.href = `/voting/${eventId}`;
                    }}
                  />
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
