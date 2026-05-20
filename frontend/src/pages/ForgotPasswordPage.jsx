import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Loader } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      setResetToken(response.resetToken || '');
      toast.success('Check your email for the reset token');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send reset token');
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
          <h1 className="text-3xl font-bold mb-3">Forgot Password</h1>
          <p className="text-dark-400 mb-8">Enter your email to receive a reset OTP.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-dark-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          {resetToken && (
            <div className="bg-dark-800 rounded-xl border border-primary-500/20 p-4 mt-6 text-sm text-dark-200">
              <p className="font-semibold text-primary-400 mb-2">Reset Token</p>
              <p className="break-words mb-3">{resetToken}</p>
              <button
                type="button"
                onClick={() => navigate('/reset-password', { state: { email, resetToken } })}
                className="btn-secondary w-full"
              >
                Continue to Reset Password
              </button>
            </div>
          )}

          <p className="text-dark-400 text-sm mt-6">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
