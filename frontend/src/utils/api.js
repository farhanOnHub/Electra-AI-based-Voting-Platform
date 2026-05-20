import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// Event API
export const eventAPI = {
  createEvent: (data) => api.post('/events', data),
  getEvents: (filters) => api.get('/events', { params: filters }),
  getEventById: (id) => api.get(`/events/${id}`),
  getEventByCode: (code) => api.post('/events/code', { eventCode: code }),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  joinEvent: (code) => api.post('/events/join', { eventCode: code }),
  getUserEvents: () => api.get('/events/user/events'),
  getEventResults: (eventId) => api.get(`/events/${eventId}/results`),
  getAdminAnalytics: () => api.get('/events/admin/analytics')
};

// Candidate API
export const candidateAPI = {
  addCandidate: (data) => api.post('/candidates', data),
  updateCandidate: (id, data) => api.put(`/candidates/${id}`, data),
  deleteCandidate: (id) => api.delete(`/candidates/${id}`),
  getCandidatesByEvent: (eventId) => api.get(`/candidates/event/${eventId}`)
};

// Vote API
export const voteAPI = {
  castVote: (data) => api.post('/votes', data),
  getEventResults: (eventId) => api.get(`/votes/${eventId}/results`),
  checkIfVoted: (eventId) => api.get(`/votes/${eventId}/check`),
  getUserVotingHistory: () => api.get('/votes/history')
};

// Notification API
export const notificationAPI = {
  createNotification: (data) => api.post('/notifications', data),
  getUserNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread/count')
};

// OTP API
export const otpAPI = {
  sendOTP: (data) => api.post('/otp/send', data),
  verifyOTP: (data) => api.post('/otp/verify', data),
  resendOTP: (data) => api.post('/otp/resend', data)
};

// Face verification API
export const faceVerificationAPI = {
  captureFaceImage: (data) => api.post('/face-verification/capture', data),
  verifyFaceBeforeVote: (data) => api.post('/face-verification/verify-vote', data),
  disableFaceVerification: () => api.post('/face-verification/disable'),
  checkFaceVerification: () => api.get('/face-verification/check')
};

// Organization API
export const organizationAPI = {
  createOrganization: (data) => api.post('/organizations', data),
  getOrganization: (id) => api.get(`/organizations/${id}`),
  updateOrganization: (id, data) => api.put(`/organizations/${id}`, data),
  addAllowedDomain: (data) => api.post(`/organizations/${data.organizationId}/domain`, data),
  removeAllowedDomain: (data) => api.delete(`/organizations/${data.organizationId}/domain`, { data }),
  getOrganizationMembers: (id) => api.get(`/organizations/${id}/members`)
};

// Public results API
export const publicResultsAPI = {
  generatePublicResult: (data) => api.post('/public-results', data),
  getPublicResults: (slug) => api.get(`/public-results/share/${slug}`),
  generateQRCode: (data) => api.post('/public-results/qr-code', data),
  exportResults: (data) => api.post('/public-results/export', data),
  sharePublicResult: (slug) => api.post(`/public-results/share/${slug}/increment`)
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
  getEventMessages: (eventId, params) => api.get(`/chat/${eventId}`, { params }),
  likeMessage: (messageId) => api.post(`/chat/${messageId}/like`),
  flagMessage: (messageId, data) => api.post(`/chat/${messageId}/flag`, data),
  deleteMessage: (messageId) => api.delete(`/chat/${messageId}`),
  moderateMessage: (messageId, data) => api.patch(`/chat/${messageId}/moderate`, data)
};

// Analytics API
export const analyticsAPI = {
  getPlatformAnalytics: () => api.get('/analytics/platform'),
  getEventAnalytics: (eventId) => api.get(`/analytics/event/${eventId}`),
  getOrganizationAnalytics: (organizationId) => api.get(`/analytics/organization/${organizationId}`)
};

// AI API
export const aiAPI = {
  getElectionSummary: (eventId) => api.get(`/ai/summary/${eventId}`),
  detectFraud: (eventId) => api.get(`/ai/fraud-detection/${eventId}`),
  predictParticipation: (eventId) => api.get(`/ai/participation-prediction/${eventId}`)
};

// Audit API
export const auditAPI = {
  getAuditLogs: () => api.get('/audit'),
  getFailedLogins: () => api.get('/audit/failed-logins'),
  getSuspiciousActivities: () => api.get('/audit/suspicious'),
  getUserActivityHistory: (userId) => api.get(`/audit/${userId}`)
};

// Super Admin API
export const superAdminAPI = {
  getPlatformStats: () => api.get('/super-admin/stats'),
  getOrganizations: () => api.get('/super-admin/organizations'),
  banUser: (userId, data) => api.post(`/super-admin/users/${userId}/ban`, data),
  unbanUser: (userId, data) => api.post(`/super-admin/users/${userId}/unban`, data),
  getAuditLogs: (params) => api.get('/super-admin/audit-logs', { params }),
  getSystemHealth: () => api.get('/super-admin/health')
};

// QR API
export const qrAPI = {
  generateEventQR: (eventId) => api.get(`/qr/event/${eventId}`),
  generateResultQR: (eventId) => api.get(`/qr/result/${eventId}`)
};

export default api;
