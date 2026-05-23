import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventAPI, voteAPI, candidateAPI, adminAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Users, CheckCircle, TrendingUp, BarChart3, Upload, UserPlus, AlertTriangle, Shield, UserX, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedEventForCandidate, setSelectedEventForCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [candidateImagePreview, setCandidateImagePreview] = useState(null);
  const [showFraudAlerts, setShowFraudAlerts] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [fraudAlerts, setFraudAlerts] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    position: '',
    bio: '',
    banner: null,
    maxVotes: ''
  });
  const [candidateFormData, setCandidateFormData] = useState({
    name: '',
    position: '',
    bio: '',
    image: null,
    eventId: ''
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const eventsResponse = await eventAPI.getEvents();
      setEvents(eventsResponse.events);

      const analyticsResponse = await eventAPI.getAdminAnalytics();
      setAnalytics(analyticsResponse);

      // Load admin stats and fraud alerts
      const statsResponse = await adminAPI.getAdminStats();
      setAdminStats(statsResponse);
    } catch (error) {
      toast.error(t('dashboard.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadFraudAlerts = async () => {
    try {
      const response = await adminAPI.getFraudAlerts();
      setFraudAlerts(response);
    } catch (error) {
      toast.error('Failed to load fraud alerts');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventAPI.createEvent({
        ...formData,
        status: 'upcoming'
      });
      toast.success(t('event.eventCreated'));
      setFormData({ title: '', description: '', startTime: '', endTime: '', position: '', bio: '', banner: null, maxVotes: '' });
      setBannerPreview(null);
      setShowCreateForm(false);
      loadAdminData();
    } catch (error) {
      toast.error(t('event.createFailed'));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, banner: file });
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm(t('event.confirmDelete'))) {
      try {
        console.log('Attempting to delete event:', eventId);
        await eventAPI.deleteEvent(eventId);
        toast.success(t('event.eventDeleted'));
        loadAdminData();
      } catch (error) {
        console.error('Delete event error:', error);
        const errorMessage = error.response?.data?.message || error.message || t('event.deleteFailed');
        toast.error(errorMessage);
      }
    }
  };

  const handleAddCandidate = (eventId) => {
    setSelectedEventForCandidate(eventId);
    setCandidateFormData({ ...candidateFormData, eventId });
    setShowCandidateForm(true);
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      await candidateAPI.addCandidate({
        ...candidateFormData,
        eventId: selectedEventForCandidate
      });
      toast.success('Candidate added successfully');
      setCandidateFormData({ name: '', position: '', bio: '', image: null, eventId: '' });
      setCandidateImagePreview(null);
      setShowCandidateForm(false);
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleCandidateImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCandidateFormData({ ...candidateFormData, image: file });
      setCandidateImagePreview(URL.createObjectURL(file));
    }
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{t('dashboard.adminDashboard')}</h1>
            <p className="text-dark-300">{t('dashboard.manageEvents')}</p>
          </div>
          <button
            onClick={() => window.location.href = '/organization'}
            className="btn-secondary py-3 px-5 w-full md:w-auto"
          >
            {t('dashboard.manageOrganization')}
          </button>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[
              { icon: <TrendingUp size={24} />, label: t('dashboard.totalEvents'), value: analytics.totalEvents },
              { icon: <CheckCircle size={24} />, label: t('dashboard.activeEvents'), value: analytics.activeEvents },
              { icon: <BarChart3 size={24} />, label: t('dashboard.totalVotes'), value: analytics.totalVotes },
              { icon: <Users size={24} />, label: t('dashboard.totalParticipants'), value: analytics.totalParticipants }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-6 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-400 text-sm">{card.label}</p>
                    <p className="text-3xl font-bold text-primary-400 mt-2">{card.value}</p>
                  </div>
                  <div className="text-primary-500/30">{card.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Event Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary mb-8 flex items-center gap-2"
        >
          <Plus size={20} />
          {t('dashboard.createEvent')}
        </motion.button>

        {/* Admin Stats Cards */}
        {adminStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-xl cursor-pointer hover:bg-white/5 transition"
              onClick={() => setShowUserManagement(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-primary-400 mt-2">{adminStats.totalUsers}</p>
                </div>
                <Users className="text-primary-500/30" size={32} />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-xl cursor-pointer hover:bg-white/5 transition"
              onClick={() => setShowFraudAlerts(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Suspicious Votes</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{adminStats.suspiciousVotes}</p>
                </div>
                <AlertTriangle className="text-red-500/30" size={32} />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Banned Users</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{adminStats.bannedUsers}</p>
                </div>
                <Shield className="text-orange-500/30" size={32} />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">Active Events</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{adminStats.activeEvents}</p>
                </div>
                <Activity className="text-green-500/30" size={32} />
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Event Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 mb-8 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-6">{t('dashboard.createEvent')}</h2>
            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder={t('event.title')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="input-field"
                />
                <input
                  type="datetime-local"
                  placeholder={t('event.startTime')}
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="datetime-local"
                  placeholder={t('event.endTime')}
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder={t('event.position')}
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="input-field"
                />
              </div>

              <textarea
                placeholder={t('event.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="input-field"
                rows="4"
              />

              <textarea
                placeholder={t('event.bio')}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field"
                rows="3"
              />

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="number"
                  placeholder="Maximum Votes (Optional)"
                  value={formData.maxVotes}
                  onChange={(e) => setFormData({ ...formData, maxVotes: e.target.value })}
                  className="input-field"
                  min="1"
                />
                <div className="text-sm text-dark-400 flex items-center">
                  Leave empty for unlimited votes
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('event.banner')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="btn-secondary flex items-center gap-2 cursor-pointer"
                  >
                    <Upload size={18} /> {t('event.uploadBanner')}
                  </label>
                  {bannerPreview && (
                    <img src={bannerPreview} alt="Banner Preview" className="w-32 h-20 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  {t('event.createEventBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Create Candidate Form */}
        {showCandidateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 mb-8 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-6">Add Candidate</h2>
            <form onSubmit={handleCreateCandidate} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Candidate Name"
                  value={candidateFormData.name}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, name: e.target.value })}
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Position/Role"
                  value={candidateFormData.position}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, position: e.target.value })}
                  className="input-field"
                />
              </div>

              <textarea
                placeholder="Candidate Bio"
                value={candidateFormData.bio}
                onChange={(e) => setCandidateFormData({ ...candidateFormData, bio: e.target.value })}
                className="input-field"
                rows="3"
              />

              <div>
                <label className="block text-sm font-medium mb-2">Candidate Image</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCandidateImageChange}
                    className="hidden"
                    id="candidate-image-upload"
                  />
                  <label
                    htmlFor="candidate-image-upload"
                    className="btn-secondary flex items-center gap-2 cursor-pointer"
                  >
                    <Upload size={18} /> Upload Image
                  </label>
                  {candidateImagePreview && (
                    <img src={candidateImagePreview} alt="Candidate Preview" className="w-32 h-32 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Add Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setShowCandidateForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Events List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('dashboard.yourEvents')}</h2>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass p-4 md:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start gap-4"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-dark-300 text-sm mb-3">{event.description}</p>
                    <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
                      <span className="text-dark-400">{t('event.code')}: <span className="text-primary-400 font-semibold">{event.eventCode}</span></span>
                      <span className="text-dark-400">{t('event.status')}: <span className="text-primary-400 font-semibold capitalize">{event.status}</span></span>
                      <span className="text-dark-400">{t('event.votes')}: <span className="text-primary-400 font-semibold">{event.totalVotes}</span></span>
                      {event.maxVotes && (
                        <span className="text-dark-400">Max Votes: <span className="text-primary-400 font-semibold">{event.maxVotes}</span></span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 md:ml-4">
                    <button
                      onClick={() => handleAddCandidate(event._id)}
                      className="p-2 hover:bg-green-500/20 rounded-lg transition"
                      title="Add Candidate"
                    >
                      <UserPlus size={20} className="text-green-400" />
                    </button>
                    <button
                      onClick={() => window.location.href = `/admin/event/${event._id}`}
                      className="p-2 hover:bg-primary-500/20 rounded-lg transition"
                      title={t('common.edit')}
                    >
                      <Edit2 size={20} className="text-primary-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition"
                      title={t('common.delete')}
                    >
                      <Trash2 size={20} className="text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-dark-400">
              <p>{t('dashboard.noEventsMessage')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fraud Alerts Modal */}
      {showFraudAlerts && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFraudAlerts(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass p-8 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={24} />
                Fraud Alerts
              </h2>
              <button onClick={() => setShowFraudAlerts(false)} className="text-dark-400 hover:text-white">
                ✕
              </button>
            </div>

            {fraudAlerts ? (
              <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 font-semibold mb-2">Suspicious Votes: {fraudAlerts.totalSuspicious}</p>
                  <p className="text-dark-300 text-sm">Votes flagged for suspicious activity</p>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <p className="text-orange-400 font-semibold mb-2">IP Groups: {fraudAlerts.totalIPGroups}</p>
                  <p className="text-dark-300 text-sm">Multiple votes from same IP address</p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 font-semibold mb-2">Device Groups: {fraudAlerts.totalDeviceGroups}</p>
                  <p className="text-dark-300 text-sm">Multiple votes from same device</p>
                </div>

                {fraudAlerts.suspiciousVotes?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Suspicious Votes List</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {fraudAlerts.suspiciousVotes.map((vote, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-lg text-sm">
                          <p className="font-medium">{vote.userId?.name || 'Unknown'}</p>
                          <p className="text-dark-400">{vote.userId?.email}</p>
                          <p className="text-red-400 text-xs mt-1">{vote.suspicionReason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-dark-400">Loading fraud alerts...</p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* User Management Modal */}
      {showUserManagement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUserManagement(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass p-8 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="text-primary-400" size={24} />
                User Management
              </h2>
              <button onClick={() => setShowUserManagement(false)} className="text-dark-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                className="input-field w-full"
              />
            </div>

            <div className="space-y-2">
              <p className="text-dark-400 text-sm">User management features coming soon...</p>
              <p className="text-dark-400 text-xs">- View all users</p>
              <p className="text-dark-400 text-xs">- Ban/unban users</p>
              <p className="text-dark-400 text-xs">- View user activity</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
