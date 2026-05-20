import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicResultsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, BarChart3, Users, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const PublicResultsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await publicResultsAPI.getPublicResults(slug);
        setData(response);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load public results');
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center text-dark-300">
          <p>Public results could not be loaded.</p>
          <button onClick={() => navigate('/')} className="btn-secondary mt-4">Back to Home</button>
        </div>
      </div>
    );
  }

  const entries = Object.values(data.results || {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-primary-400 hover:text-primary-300 flex items-center gap-2 mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="glass p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">{data.event?.title}</h1>
              <p className="text-dark-400 max-w-2xl">{data.event?.description}</p>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-sm text-dark-400">Total votes</p>
              <p className="text-3xl font-bold text-primary-400">{data.totalVotes}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="glass p-6 rounded-xl">
              <p className="text-dark-400">Event ends</p>
              <p className="mt-3 font-semibold">{new Date(data.event?.endTime).toLocaleString()}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <p className="text-dark-400">Public views</p>
              <p className="mt-3 font-semibold">{data.viewCount || 0}</p>
            </div>
            <div className="glass p-6 rounded-xl">
              <p className="text-dark-400">Share URL</p>
              <p className="mt-3 text-primary-400 break-words">{window.location.href}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div className="glass p-8 rounded-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-primary-400" size={24} />
              <h2 className="text-2xl font-semibold">Vote Breakdown</h2>
            </div>
            <div className="space-y-4">
              {entries.map((item, index) => (
                <div key={index} className="p-4 bg-dark-800 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{item.candidateName}</span>
                    <span className="text-primary-400 font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="h-3 bg-dark-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-blue-600" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="glass p-8 rounded-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-primary-400" size={24} />
              <h2 className="text-2xl font-semibold">Public Engagement</h2>
            </div>
            <p className="text-dark-400 mb-4">This page allows anyone with the share link to view the public results for the event.</p>
            <button onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Result link copied'))} className="btn-primary w-full flex items-center justify-center gap-2">
              <Share2 size={18} /> Copy Share Link
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
