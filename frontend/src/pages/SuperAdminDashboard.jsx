import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { superAdminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Globe, Archive, Users, FileText, ShieldAlert } from 'lucide-react';

export const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      const statsResponse = await superAdminAPI.getPlatformStats();
      const organizationsResponse = await superAdminAPI.getOrganizations();
      const auditLogsResponse = await superAdminAPI.getAuditLogs();

      setStats(statsResponse);
      setOrganizations(organizationsResponse);
      setAuditLogs(auditLogsResponse.logs || []);
    } catch (error) {
      toast.error('Failed to load super admin dashboard');
    } finally {
      setLoading(false);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Platform Administration</h1>
          <p className="text-dark-300">Monitor organizations, audit logs, and system health across the Electra platform.</p>
        </motion.div>

        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: <Globe size={24} />, label: 'Total Organizations', value: stats.totalOrganizations },
              { icon: <ShieldCheck size={24} />, label: 'Active Users', value: stats.activeUsers },
              { icon: <Archive size={24} />, label: 'Total Events', value: stats.totalEvents }
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

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-xl">
            <div className="mb-6 flex items-center gap-3">
              <Users size={24} className="text-primary-400" />
              <h2 className="text-2xl font-semibold">Organizations</h2>
            </div>
            {organizations.length > 0 ? (
              <div className="space-y-4">
                {organizations.map((org) => (
                  <div key={org._id} className="border border-white/10 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                    <p className="text-dark-300 text-sm">Admin: {org.adminId?.name || 'Unknown'}</p>
                    <p className="text-dark-300 text-sm">Domains: {org.allowedDomains?.join(', ') || 'None'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400">No organizations found.</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-xl">
            <div className="mb-6 flex items-center gap-3">
              <FileText size={24} className="text-primary-400" />
              <h2 className="text-2xl font-semibold">Recent Audit Logs</h2>
            </div>
            {auditLogs.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {auditLogs.slice(0, 8).map((log) => (
                  <div key={log._id} className="border border-white/10 rounded-xl p-4 bg-white/5">
                    <p className="text-sm text-dark-300 mb-2">{new Date(log.createdAt).toLocaleString()}</p>
                    <p className="text-white text-sm font-medium">{log.action}</p>
                    <p className="text-dark-300 text-sm">User: {log.userId?.email || 'Unknown'}</p>
                    <p className="text-dark-300 text-sm">Target: {log.targetUserId?.email || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400">No audit logs available.</p>
            )}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert size={24} className="text-primary-400" />
            <h2 className="text-2xl font-semibold">Security Summary</h2>
          </div>
          <p className="text-dark-300 leading-relaxed">
            Super admins can review platform metrics, audit access patterns, and confirm overall system health.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
