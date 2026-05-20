import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Building2, Camera, Save, Shield } from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({ name: '', organization: '', profileImage: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        organization: user.organization || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass p-8">
          <h1 className="text-3xl font-bold mb-3">Your Profile</h1>
          <p className="text-dark-400 mb-8">Update your name, organization, and profile image.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-dark-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organization</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-dark-400" size={20} />
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Organization"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Profile Image URL</label>
              <div className="relative">
                <Camera className="absolute left-3 top-3 text-dark-400" size={20} />
                <input
                  type="text"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary flex items-center justify-center gap-2">
              <Save size={18} /> Save Changes
            </button>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/face-verification')}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Shield size={18} /> Manage Face Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
