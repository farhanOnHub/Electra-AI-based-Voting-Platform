import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, publicResultsAPI, qrAPI, aiAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, QrCode, Share2, Download } from 'lucide-react';

export const AdminEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', startTime: '', endTime: '', status: 'upcoming', isResultsVisible: false, banner: '' });
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [publishMessage, setPublishMessage] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [fraudResult, setFraudResult] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadEvent = async () => {
    try {
      const response = await eventAPI.getEventById(eventId);
      setEvent(response.event);
      setFormData({
        title: response.event.title,
        description: response.event.description,
        startTime: response.event.startTime?.slice(0, 16) || '',
        endTime: response.event.endTime?.slice(0, 16) || '',
        status: response.event.status || 'upcoming',
        isResultsVisible: response.event.isResultsVisible || false,
        banner: response.event.banner || ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load event');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const loadAiAnalysis = async (eventId) => {
    try {
      setAiLoading(true);
      const [summaryResponse, fraudResponse, predictionResponse] = await Promise.all([
        aiAPI.getElectionSummary(eventId),
        aiAPI.detectFraud(eventId),
        aiAPI.predictParticipation(eventId)
      ]);
      setAiSummary(summaryResponse);
      setFraudResult(fraudResponse);
      setPredictionResult(predictionResponse);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await loadEvent();
      await loadAiAnalysis(eventId);
    };

    initialize();
  }, [eventId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await eventAPI.updateEvent(eventId, formData);
      toast.success('Event updated');
      loadEvent();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await qrAPI.generateEventQR(eventId);
      setQrCode(response.qrCode);
      toast.success('QR code generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR');
    }
  };

  const handlePublishResults = async () => {
    try {
      const response = await publicResultsAPI.generatePublicResult({ eventId });
      setShareUrl(response.shareUrl);
      setPublishMessage('Public results generated. Share the link below.');
      toast.success('Public results published');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish results');
    }
  };

  const handleRefreshAi = () => {
    loadAiAnalysis(eventId);
  };

  const handleExport = async (format) => {
    try {
      const response = await publicResultsAPI.exportResults({ eventId, format });
      const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `results-${eventId}.${format === 'csv' ? 'csv' : 'json'}`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Export ready');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export results');
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
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/admin')} className="text-primary-400 hover:text-primary-300 flex items-center gap-2 mb-6">
          <ArrowLeft size={18} /> Back to Admin
        </button>

        <div className="glass p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Manage Event</h1>
              <p className="text-dark-400">Edit event details and publish results or QR codes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleGenerateQR} className="btn-secondary flex items-center gap-2">
                <QrCode size={18} /> Generate QR
              </button>
              <button onClick={handlePublishResults} className="btn-primary flex items-center gap-2">
                <Share2 size={18} /> Publish Results
              </button>
              <button onClick={() => handleExport('json')} className="btn-secondary flex items-center gap-2">
                <Download size={18} /> Export JSON
              </button>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event Title"
              className="input-field w-full"
              required
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event Description"
              className="input-field w-full min-h-[140px]"
              required
            />
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-field w-full"
                required
              />
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>
            <input
              type="text"
              name="banner"
              value={formData.banner}
              onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
              placeholder="Banner image URL"
              className="input-field w-full"
            />
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <select
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <label className="flex items-center gap-3 text-sm text-dark-300">
                <input
                  type="checkbox"
                  checked={formData.isResultsVisible}
                  onChange={(e) => setFormData({ ...formData, isResultsVisible: e.target.checked })}
                />
                Show results publicly
              </label>
            </div>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2">
              <Save size={18} /> Save Changes
            </button>
          </form>

          {qrCode && (
            <div className="glass p-6 rounded-xl mt-8">
              <h2 className="text-xl font-semibold mb-4">Event QR Code</h2>
              <img src={qrCode} alt="Event QR" className="mx-auto rounded-xl" />
              <div className="flex justify-center gap-3 mt-4">
                <a
                  href={qrCode}
                  download={`event-${eventId}-qr.png`}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download size={16} /> Download QR
                </a>
                <button
                  onClick={() => { navigator.clipboard.writeText(event?.eventCode || '') && toast.success('Event code copied'); }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Share2 size={16} /> Copy Code
                </button>
              </div>
            </div>
          )}

          {shareUrl && (
            <div className="glass p-6 rounded-xl mt-8">
              <h2 className="text-xl font-semibold mb-4">Public Results</h2>
              <p className="text-dark-400 mb-4">Share this link to display results publicly.</p>
              <div className="bg-dark-800 p-4 rounded-xl break-words">{shareUrl}</div>
            </div>
          )}

          {publishMessage && (
            <div className="mt-6 text-sm text-primary-300">{publishMessage}</div>
          )}

          <div className="glass p-6 rounded-xl mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-semibold">AI Insights</h2>
                <p className="text-dark-400">Generated election summary, fraud detection, and participation prediction.</p>
              </div>
              <button onClick={handleRefreshAi} className="btn-secondary">
                Refresh AI Insights
              </button>
            </div>

            {aiLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {aiSummary && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="glass p-4 rounded-xl">
                      <p className="text-dark-400 text-sm mb-2">Total Votes</p>
                      <p className="text-3xl font-bold text-primary-400">{aiSummary.totalVotes}</p>
                    </div>
                    <div className="glass p-4 rounded-xl">
                      <p className="text-dark-400 text-sm mb-2">Participants</p>
                      <p className="text-3xl font-bold text-primary-400">{aiSummary.totalParticipants}</p>
                    </div>
                    <div className="glass p-4 rounded-xl">
                      <p className="text-dark-400 text-sm mb-2">Turnout</p>
                      <p className="text-3xl font-bold text-primary-400">{aiSummary.participationRate}%</p>
                    </div>
                  </div>
                )}

                {aiSummary && (
                  <div className="glass p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-4">Election Summary</h3>
                    <p className="text-dark-300 mb-2">Winner: <span className="text-white font-medium">{aiSummary.winner}</span></p>
                    <p className="text-dark-300 mb-2">Votes for winner: <span className="text-white font-medium">{aiSummary.winnerVotes}</span></p>
                    <p className="text-dark-300 mb-2">Winner share: <span className="text-white font-medium">{aiSummary.winnerPercentage}%</span></p>
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      {aiSummary.candidateResults.map((candidate) => (
                        <div key={candidate.name} className="border border-white/10 p-4 rounded-xl">
                          <p className="text-sm text-dark-400">{candidate.name}</p>
                          <p className="text-white font-semibold">{candidate.votes} votes</p>
                          <p className="text-primary-400">{candidate.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fraudResult && (
                  <div className="glass p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-4">Fraud Detection</h3>
                    <p className="text-dark-300 mb-2">Fraud score: <span className="text-white font-medium">{fraudResult.fraudScore}</span></p>
                    <p className="text-dark-300 mb-2">Secure status: <span className="text-white font-medium">{fraudResult.isSecure ? 'Secure' : 'Attention needed'}</span></p>
                    {fraudResult.suspiciousActivity?.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {fraudResult.suspiciousActivity.map((activity, index) => (
                          <div key={index} className="border border-red-500/20 bg-red-500/5 p-3 rounded-xl">
                            <p className="text-sm text-white font-semibold">{activity.type.replace('_', ' ')}</p>
                            <pre className="text-xs text-dark-300 whitespace-pre-wrap">{JSON.stringify(activity, null, 2)}</pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-dark-300">No suspicious activity detected.</p>
                    )}
                  </div>
                )}

                {predictionResult && (
                  <div className="glass p-6 rounded-xl">
                    <h3 className="text-xl font-semibold mb-4">Participation Prediction</h3>
                    <p className="text-dark-300 mb-2">Current votes: <span className="text-white font-medium">{predictionResult.currentVotes}</span></p>
                    <p className="text-dark-300 mb-2">Predicted votes: <span className="text-white font-medium">{predictionResult.predictedVotes}</span></p>
                    <p className="text-dark-300 mb-2">Predicted participation: <span className="text-white font-medium">{predictionResult.predictedParticipationRate}%</span></p>
                    <p className="text-dark-300 mb-2">Confidence: <span className="text-white font-medium">{predictionResult.confidence}%</span></p>
                    <div className="mt-4 space-y-2">
                      {predictionResult.recommendations?.map((recommendation, index) => (
                        <p key={index} className="text-dark-300">• {recommendation}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
