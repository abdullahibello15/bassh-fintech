import { Shield, Bell, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function AdminSettings() {
  const [autoApproval, setAutoApproval] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: 'clamp(30px, 9vw, 36px)', color: '#ffffff' }}>
          Admin Settings
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Configure platform settings</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Security Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Withdrawal Approval Threshold
              </label>
              <input
                type="number"
                defaultValue="10000"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
                Withdrawals above this amount require manual approval
              </p>
            </div>

            <div className="flex items-start justify-between gap-4 py-4 border-t border-white/10">
              <div>
                <div style={{ color: '#ffffff' }} className="mb-1">
                  Auto-approve Small Withdrawals
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Automatically approve withdrawals under $1,000
                </div>
              </div>
              <button
                onClick={() => setAutoApproval(!autoApproval)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  autoApproval ? 'bg-[#c9a84c]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    autoApproval ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 py-3 border-b border-white/10">
              <div>
                <div style={{ color: '#ffffff' }} className="mb-1">
                  Email Notifications
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Receive alerts for important events
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  emailNotifications ? 'bg-[#c9a84c]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    emailNotifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Admin Email
              </label>
              <input
                type="email"
                defaultValue="admin@fintech.com"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              System
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="Fintech"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@fintech.com"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                API Rate Limit (requests/hour)
              </label>
              <input
                type="number"
                defaultValue="1000"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <button className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105">
              Save All Settings
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
