import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, Loader } from 'lucide-react';

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email: initialEmail, resetToken: initialResetToken } = location.state || {};
  const [formData, setFormData] = useState({ email: initialEmail || '', resetToken: initialResetToken || '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.resetPassword({ resetToken: formData.resetToken, newPassword: formData.newPassword });
      toast.success('Password reset successful! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-400 hover:text-primary-300 flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="glass p-8">
          <h1 className="text-3xl font-bold mb-3">Reset Password</h1>
          <p className="text-dark-400 mb-8">Enter the reset token and your new password.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reset Token</label>
              <input
                type="text"
                name="resetToken"
                value={formData.resetToken}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter reset token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-dark-400" size={20} />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-dark-400 text-sm mt-6">
            Return to{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300">
              sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
