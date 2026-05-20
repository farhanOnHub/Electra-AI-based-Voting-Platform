import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Bell, CheckCircle2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getUserNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark read');
    }
  };

  const removeNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-primary-400 hover:text-primary-300 flex items-center gap-2 mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="glass p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={24} className="text-primary-400" />
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-dark-400">Stay up to date with the latest event alerts and reminders.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-dark-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-dark-400">No notifications yet.</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification._id} className={`p-5 rounded-3xl border ${notification.read ? 'border-white/10 bg-dark-900' : 'border-primary-500/30 bg-primary-500/10'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-white">{notification.title || 'Notification'}</p>
                      <p className="text-dark-300 text-sm mt-2">{notification.message}</p>
                      <p className="text-dark-500 text-xs mt-3">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button onClick={() => markRead(notification._id)} className="text-green-400 hover:text-green-300">
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button onClick={() => removeNotification(notification._id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
