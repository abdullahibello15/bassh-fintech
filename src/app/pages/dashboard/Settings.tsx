import { FormEvent, useEffect, useState } from 'react';
import { Bell, CheckCircle, Globe, Shield, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../../context/AppContext';
import { saveUser } from '../../api/usersApi';

export function Settings() {
  const { currentUser, upsertUser } = useAppContext();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('usd');
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    setFullName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone || '');
  }, [currentUser]);

  const showSaved = (setter: (value: boolean) => void) => {
    setter(true);
    window.setTimeout(() => setter(false), 2500);
  };

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      alert('Please log in first');
      return;
    }
    if (!fullName.trim() || !email.trim()) {
      alert('Name and email are required');
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await saveUser(currentUser, {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      });
      upsertUser(updatedUser);
      showSaved(setProfileSaved);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      alert('Please log in first');
      return;
    }
    if (currentUser.password && currentPassword !== currentUser.password) {
      alert('Current password is incorrect');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await saveUser(currentUser, { password: newPassword });
      upsertUser(updatedUser);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSaved(setPasswordSaved);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save password.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div>
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Settings
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Please sign in to manage your account settings.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Settings
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage your account settings</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <motion.form
          onSubmit={handleProfileSave}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Profile Information
            </h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
              <div className="mb-1 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Full Name
              </div>
              <div className="break-words font-heading" style={{ fontSize: '20px', color: '#ffffff' }}>
                {currentUser.name}
              </div>
            </div>
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Add your phone number"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
              {profileSaved && (
                <span className="inline-flex items-center gap-2 text-[#10b981]">
                  <CheckCircle className="w-4 h-4" />
                  Saved
                </span>
              )}
            </div>
          </div>
        </motion.form>

        <motion.form
          onSubmit={handlePasswordSave}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Security
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div>
                <div style={{ color: '#ffffff' }} className="mb-1">
                  Two-Factor Authentication
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Add an extra layer of security
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative w-12 h-6 rounded-full transition-all ${twoFactorEnabled ? 'bg-[#c9a84c]' : 'bg-white/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${twoFactorEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Change Password'}
              </button>
              {passwordSaved && (
                <span className="inline-flex items-center gap-2 text-[#10b981]">
                  <CheckCircle className="w-4 h-4" />
                  Updated
                </span>
              )}
            </div>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                label: 'Email Notifications',
                description: 'Receive transaction alerts via email',
                value: emailNotifications,
                onChange: setEmailNotifications,
              },
              {
                label: 'Push Notifications',
                description: 'Receive notifications on your device',
                value: pushNotifications,
                onChange: setPushNotifications,
              },
            ].map((item, index) => (
              <div key={item.label} className={`flex items-center justify-between py-3 ${index === 0 ? 'border-b border-white/10' : ''}`}>
                <div>
                  <div style={{ color: '#ffffff' }} className="mb-1">
                    {item.label}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {item.description}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => item.onChange(!item.value)}
                  className={`relative w-12 h-6 rounded-full transition-all ${item.value ? 'bg-[#c9a84c]' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.value ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Preferences
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Language
              </label>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Currency
              </label>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (EUR)</option>
                <option value="gbp">GBP (GBP)</option>
                <option value="jpy">JPY (JPY)</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
