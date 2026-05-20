import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ChatPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await chatAPI.getEventMessages(eventId, { limit: 50 });
        setMessages(response.messages || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await chatAPI.sendMessage({ eventId, message: newMessage });
      setMessages([...messages, response.chatMessage]);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-primary-400 hover:text-primary-300 flex items-center gap-2 mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="glass p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="text-primary-400" size={24} />
            <div>
              <h1 className="text-3xl font-bold">Event Chat</h1>
              <p className="text-dark-400">Discuss the event, ask questions, and engage with other voters.</p>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl mb-6 max-h-[520px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-20 text-dark-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-dark-400">No messages yet. Start the conversation!</div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-800 p-4 rounded-3xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <p className="font-semibold text-sm">{message.userName}</p>
                      <span className="text-dark-400 text-xs">{new Date(message.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-dark-200">{message.message}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="input-field flex-1"
            />
            <button onClick={handleSend} disabled={sending} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Send size={18} /> {sending ? 'Sending' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
