import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Building2, Globe, Plus, Trash2, ArrowLeft } from 'lucide-react';

export const OrganizationPage = () => {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', logo: '' });
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const loadOrganization = async () => {
    if (!organization?._id) return;

    try {
      const response = await organizationAPI.getOrganization(organization._id);
      setOrganization(response.organization);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load organization');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await organizationAPI.createOrganization(formData);
      setOrganization(response.organization);
      toast.success('Organization created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!domain.trim()) return;
    setLoading(true);

    try {
      const response = await organizationAPI.addAllowedDomain({ organizationId: organization._id, domain: domain.trim() });
      setOrganization(response.organization);
      setDomain('');
      toast.success('Domain added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDomain = async (domainToRemove) => {
    setLoading(true);

    try {
      const response = await organizationAPI.removeAllowedDomain({ organizationId: organization._id, domain: domainToRemove });
      setOrganization(response.organization);
      toast.success('Domain removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove domain');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, [organization?._id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-primary-400 hover:text-primary-300 flex items-center gap-2 mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="glass p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Building2 size={28} className="text-primary-400" />
            <div>
              <h1 className="text-3xl font-bold">Organization Management</h1>
              <p className="text-dark-400">Create and manage your organization-level settings.</p>
            </div>
          </div>

          {!organization ? (
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Organization Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Support Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Logo URL</label>
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn-primary">Create Organization</button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{organization.name}</h2>
                    <p className="text-dark-400">Admin: {organization.adminUser?.name || 'You'}</p>
                  </div>
                  <div className="text-right text-sm text-dark-400">API Key: {organization.apiKey?.slice(0, 16)}...</div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Allowed Email Domains</h2>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.edu"
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={handleAddDomain} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {organization.allowedDomains?.length > 0 ? (
                    organization.allowedDomains.map((item) => (
                      <div key={item.domain} className="flex items-center justify-between gap-4 p-4 bg-dark-800 rounded-xl border border-white/10">
                        <div>
                          <p className="font-medium">{item.domain}</p>
                          <p className="text-dark-400 text-sm">{item.verified ? 'Verified' : 'Pending verification'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(item.domain)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-dark-400">No allowed domains configured yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
