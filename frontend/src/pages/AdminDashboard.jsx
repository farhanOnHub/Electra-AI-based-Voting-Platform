import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventAPI, voteAPI } from '../utils/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Users, CheckCircle, TrendingUp, BarChart3, Upload } from 'lucide-react';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    position: '',
    bio: '',
    banner: null
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
    } catch (error) {
      toast.error(t('dashboard.loadFailed'));
    } finally {
      setLoading(false);
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
      setFormData({ title: '', description: '', startTime: '', endTime: '', position: '', bio: '', banner: null });
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
            <h1 className="text-4xl font-bold mb-2">{t('dashboard.adminDashboard')}</h1>
            <p className="text-dark-300">{t('dashboard.manageEvents')}</p>
          </div>
          <button
            onClick={() => window.location.href = '/organization'}
            className="btn-secondary py-3 px-5"
          >
            {t('dashboard.manageOrganization')}
          </button>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
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
                  className="glass p-6 rounded-xl flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-dark-300 text-sm mb-3">{event.description}</p>
                    <div className="flex gap-6 text-sm">
                      <span className="text-dark-400">{t('event.code')}: <span className="text-primary-400 font-semibold">{event.eventCode}</span></span>
                      <span className="text-dark-400">{t('event.status')}: <span className="text-primary-400 font-semibold capitalize">{event.status}</span></span>
                      <span className="text-dark-400">{t('event.votes')}: <span className="text-primary-400 font-semibold">{event.totalVotes}</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
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
    </div>
  );
};
