import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { eventAPI, voteAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, TrendingUp, Award, Activity } from 'lucide-react';

export const ResultsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    loadResults();
    // Initialize Socket.IO for real-time updates
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_event', eventId);
    });

    socket.on('vote_update', (data) => {
      if (data.eventId !== eventId) return;
      // Update results in real-time
      loadResults();
      setLastUpdate(new Date());
    });

    socket.on('final_results', (payload) => {
      if (payload.eventId !== eventId) return;
      loadResults();
      setLastUpdate(new Date());
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

  const loadResults = async () => {
    try {
      const resultsData = await voteAPI.getEventResults(eventId);
      setResults(resultsData.results);
      setEvent(resultsData.event);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || 'Results are not yet visible');
      } else {
        toast.error('Failed to load results');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const chartData = results?.map(r => ({
    name: r.candidateName,
    votes: r.voteCount,
    percentage: parseFloat(r.percentage)
  })) || [];

  const winner = results?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{event?.title}</h1>
              <p className="text-dark-300">Live Voting Results</p>
            </div>
            {lastUpdate && (
              <div className="flex items-center gap-2 text-green-400">
                <Activity size={16} className="animate-pulse" />
                <span className="text-sm">Live</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-xl"
          >
            <p className="text-dark-400 text-sm">Total Votes</p>
            <p className="text-4xl font-bold text-primary-400 mt-2">{event?.totalVotes || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl"
          >
            <p className="text-dark-400 text-sm">Participants</p>
            <p className="text-4xl font-bold text-primary-400 mt-2">{event?.participants?.length || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl"
          >
            <p className="text-dark-400 text-sm">Status</p>
            <p className={`text-2xl font-bold mt-2 ${
              event?.status === 'active' ? 'text-green-400' :
              event?.status === 'upcoming' ? 'text-blue-400' :
              'text-gray-400'
            }`}>
              {event?.status?.toUpperCase()}
            </p>
          </motion.div>
        </div>

        {/* Winner Announcement */}
        {winner && event?.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 mb-8 rounded-xl border-2 border-yellow-500/50 bg-yellow-500/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <Award className="text-yellow-400" size={32} />
              <h2 className="text-2xl font-bold text-yellow-400">🎉 Winner 🎉</h2>
            </div>
            <p className="text-3xl font-bold mb-2">{winner.candidateName}</p>
            <p className="text-lg text-yellow-300">
              with {winner.voteCount} votes ({winner.percentage}%)
            </p>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-6">Vote Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="votes" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-6">Vote Percentage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Results Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold mb-6">Detailed Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-dark-400">Rank</th>
                  <th className="text-left py-3 px-4 text-dark-400">Candidate</th>
                  <th className="text-right py-3 px-4 text-dark-400">Votes</th>
                  <th className="text-right py-3 px-4 text-dark-400">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results?.map((candidate, idx) => (
                  <motion.tr
                    key={candidate.candidateId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <span className="text-xl font-bold text-primary-400">#{idx + 1}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">{candidate.candidateName}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-primary-400">{candidate.voteCount}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary-500 to-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${candidate.percentage}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-dark-400 w-12 text-right">{candidate.percentage}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
