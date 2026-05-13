import { Search, X, Mail, DollarSign, Calendar, CreditCard, Shield, Edit, Trash2, Lock, Eye, Loader2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useAppContext, UserType } from '../../context/AppContext';
import { ADMIN_CREDENTIALS } from '../../auth/adminCredentials';
import { createUser, fetchUsers, removeUser, saveUser, updateUserStatus } from '../../api/usersApi';

export function Users() {
  const { users, replaceUsers, upsertUser, deleteUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add User Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountType, setAccountType] = useState<string>('Standard');
  const [status, setStatus] = useState<'Active' | 'Suspended'>('Active');

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setInitialBalance('');
    setAccountType('Standard');
    setStatus('Active');
  };

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setErrorMessage('');

      try {
        const apiUsers = await fetchUsers();
        if (isMounted) {
          replaceUsers(apiUsers);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load users.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const balance = parseFloat(initialBalance);

    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !initialBalance) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    if (!Number.isFinite(balance)) {
      setErrorMessage('Please enter a valid initial balance');
      return;
    }
    if (normalizedEmail === ADMIN_CREDENTIALS.email) {
      setErrorMessage('This email is reserved for admin access');
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setErrorMessage('Email already exists');
      return;
    }

    setIsSaving(true);

    try {
      const newUser = await createUser({
        name: fullName,
        email: normalizedEmail,
        phone: trimmedPhone,
        password,
        balance,
        status,
        accountType
      });
      upsertUser(newUser);
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    const [first, ...last] = user.name.split(' ');
    setFirstName(first);
    setLastName(last.join(' '));
    setEmail(user.email);
    setPhone(user.phone || '');
    setPassword('');
    setInitialBalance(user.balance.toString());
    setAccountType(user.accountType || 'Standard');
    setStatus(user.status);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: UserType) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (user: UserType) => {
    if (isSaving) return;

    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    setIsSaving(true);
    setErrorMessage('');

    try {
      const updatedUser = await updateUserStatus(user, nextStatus);
      upsertUser(updatedUser);
      setSelectedUser((current) =>
        current?.id === user.id ? { ...current, ...updatedUser } : current
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const balance = parseFloat(initialBalance);

    setErrorMessage('');

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !initialBalance || !selectedUser) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    if (!Number.isFinite(balance)) {
      setErrorMessage('Please enter a valid account balance');
      return;
    }
    if (normalizedEmail === ADMIN_CREDENTIALS.email) {
      setErrorMessage('This email is reserved for admin access');
      return;
    }
    if (users.some((user) => user.id !== selectedUser.id && user.email.toLowerCase() === normalizedEmail)) {
      setErrorMessage('Email already exists');
      return;
    }

    const updates: Partial<UserType> = {
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: normalizedEmail,
      phone: trimmedPhone,
      balance,
      accountType,
      status,
    };

    if (password) {
      updates.password = password;
    }

    setIsSaving(true);

    try {
      const updatedUser = await saveUser(selectedUser, updates);
      upsertUser(updatedUser);
      resetForm();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser || isSaving) return;

    setIsSaving(true);
    setErrorMessage('');

    try {
      await removeUser(selectedUser);
      deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete user.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Users Management
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage all user accounts</p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#c9a84c] text-[#0a0e1a] hover:bg-[#b89640] transition-all hover:scale-105"
        >
          Add User
        </button>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Name
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Email
                </th>
                <th className="text-right p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Balance
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Joined
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUsers ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center"
                    style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading users...
                    </span>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="p-4" style={{ color: '#ffffff' }}>
                      <div className="font-medium">{user.name}</div>
                      <div className="mt-1 text-sm text-white/45">#{String(user.id).padStart(6, '0')}</div>
                    </td>
                    <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {user.email}
                    </td>
                    <td className="p-4 text-right" style={{ color: '#c9a84c' }}>
                      ${user.balance.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-[#10b981]/20 text-[#10b981]'
                            : 'bg-[#ef4444]/20 text-[#ef4444]'
                        }`}
                        style={{ fontSize: '14px' }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {user.joined}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 transition-all text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/30 transition-all text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={isSaving}
                          className="px-3 py-2 rounded bg-white/10 text-white/80 hover:bg-white/15 transition-all text-sm"
                        >
                          {isSaving ? 'Saving...' : user.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30 transition-all text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center"
                    style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="md:hidden space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl bg-gradient-to-br from-[#141e32]/70 to-[#0a0e1a]/70 backdrop-blur-xl border border-[#c9a84c]/20 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="font-heading truncate" style={{ color: '#ffffff', fontSize: '20px' }}>
                    {user.name}
                  </div>
                  <div className="truncate mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    {user.email}
                  </div>
                </div>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full ${
                    user.status === 'Active'
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : 'bg-[#ef4444]/20 text-[#ef4444]'
                  }`}
                  style={{ fontSize: '13px' }}
                >
                  {user.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg bg-white/5 p-3">
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Balance</div>
                  <div className="mt-1 font-heading" style={{ color: '#c9a84c', fontSize: '18px' }}>
                    ${user.balance.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Joined</div>
                  <div className="mt-1" style={{ color: '#ffffff', fontSize: '14px' }}>
                    {user.joined}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleViewUser(user)}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 transition-all text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleEditUser(user)}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/30 transition-all text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(user)}
                  disabled={isSaving}
                  className="px-3 py-2 rounded bg-white/10 text-white/80 hover:bg-white/15 transition-all text-sm"
                >
                  {isSaving ? 'Saving...' : user.status === 'Active' ? 'Suspend' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30 transition-all text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div
            className="rounded-xl bg-gradient-to-br from-[#141e32]/70 to-[#0a0e1a]/70 backdrop-blur-xl border border-[#c9a84c]/20 p-8 text-center"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            No users found.
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-3 py-6 sm:items-center sm:p-4"
            >
              <div className="relative w-full max-w-2xl max-h-[calc(100vh-3rem)] overflow-y-auto p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#c9a84c]/40 shadow-2xl">
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                <div className="mb-6">
                  <h2 className="font-heading mb-2" style={{ fontSize: '28px', color: '#ffffff' }}>
                    Add New User
                  </h2>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Create a new user account</p>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                  {/* Name Fields - 2 Column Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create user password"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Initial Balance */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Initial Balance
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="number"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Account Type
                    </label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Account Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'Active' | 'Suspended')}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setShowAddModal(false);
                      }}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
                    >
                      {isSaving ? 'Adding...' : 'Add User'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {showViewModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowViewModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-3 py-6 sm:items-center sm:p-4"
            >
              <div className="relative w-full max-w-2xl max-h-[calc(100vh-3rem)] overflow-y-auto p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#c9a84c]/40 shadow-2xl">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                {/* User Avatar & Header */}
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b89640] flex items-center justify-center">
                    <span className="font-heading" style={{ fontSize: '28px', color: '#0a0e1a' }}>
                      {getInitials(selectedUser.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading mb-2 break-words" style={{ fontSize: '28px', color: '#ffffff' }}>
                      {selectedUser.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          selectedUser.status === 'Active'
                            ? 'bg-[#10b981]/20 text-[#10b981]'
                            : 'bg-[#ef4444]/20 text-[#ef4444]'
                        }`}
                        style={{ fontSize: '14px' }}
                      >
                        {selectedUser.status}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full bg-[#3b82f6]/20 text-[#3b82f6]"
                        style={{ fontSize: '14px' }}
                      >
                        {selectedUser.accountType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Balance Card */}
                <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#c9a84c]/20 to-[#b89640]/10 border border-[#c9a84c]/30">
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                    Account Balance
                  </div>
                  <div className="font-heading break-words" style={{ fontSize: '32px', color: '#c9a84c' }}>
                    ${selectedUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Account Metadata */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <Shield className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>User ID</div>
                      <div style={{ color: '#ffffff' }}>#{String(selectedUser.id).padStart(6, '0')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <Mail className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Email</div>
                      <div className="break-all" style={{ color: '#ffffff' }}>{selectedUser.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <Phone className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Phone</div>
                      <div className="break-all" style={{ color: '#ffffff' }}>{selectedUser.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <Calendar className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Joined Date</div>
                      <div style={{ color: '#ffffff' }}>{selectedUser.joined}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <CreditCard className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Account Type</div>
                      <div style={{ color: '#ffffff' }}>{selectedUser.accountType}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col gap-3 pt-4 border-t border-white/10 sm:flex-row">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditUser(selectedUser);
                    }}
                    className="flex-1 px-6 py-3 border border-[#c9a84c]/40 text-[#c9a84c] rounded-lg hover:border-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedUser)}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 border border-white/20 text-white rounded-lg hover:border-white/40 hover:bg-white/10 transition-all"
                  >
                    {isSaving ? 'Saving...' : selectedUser.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleDeleteUser(selectedUser);
                    }}
                    className="flex-1 px-6 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all hover:scale-105"
                  >
                    Close Account
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-3 py-6 sm:items-center sm:p-4"
            >
              <div className="relative w-full max-w-2xl max-h-[calc(100vh-3rem)] overflow-y-auto p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#c9a84c]/40 shadow-2xl">
                <button
                  onClick={() => {
                    resetForm();
                    setShowEditModal(false);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                <div className="mb-6">
                  <h2 className="font-heading mb-2" style={{ fontSize: '28px', color: '#ffffff' }}>
                    Edit User
                  </h2>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Update user account information</p>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-4">
                  {/* Name Fields - 2 Column Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Reset */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Balance */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Account Balance
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="number"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Account Type
                    </label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Account Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'Active' | 'Suspended')}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setShowEditModal(false);
                      }}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-start justify-center z-50 overflow-y-auto p-3 py-6 sm:items-center sm:p-4"
            >
              <div className="relative w-full max-w-md max-h-[calc(100vh-3rem)] overflow-y-auto p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#ef4444]/40 shadow-2xl">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-[#ef4444]" />
                  </div>

                  <h2 className="font-heading mb-4" style={{ fontSize: '28px', color: '#ffffff' }}>
                    Delete User
                  </h2>

                  <p className="mb-2" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                    Are you sure you want to delete <span className="text-[#c9a84c]">{selectedUser.name}</span>?
                  </p>

                  <p className="mb-8" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.6' }}>
                    This action cannot be undone. All user data and transaction history will be permanently removed.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 border border-white/20 text-white rounded-lg hover:border-white/40 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all hover:scale-105"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
