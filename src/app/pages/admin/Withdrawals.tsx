import { Search, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export function Withdrawals() {
  const { withdrawals, updateWithdrawal } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const today = new Date().toISOString().split('T')[0];

  const handleApprove = (id: number) => {
    updateWithdrawal(id, 'Approved');
  };

  const handleReject = (id: number) => {
    updateWithdrawal(id, 'Rejected');
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch =
      w.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || w.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: 'clamp(30px, 9vw, 36px)', color: '#ffffff' }}>
          Withdrawal Requests
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage withdrawal requests</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-2">
            Pending Requests
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#c9a84c' }}>
            {withdrawals.filter((w) => w.status === 'Pending').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-2">
            Total Amount Pending
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#c9a84c' }}>
            ${withdrawals
              .filter((w) => w.status === 'Pending')
              .reduce((sum, w) => sum + w.amount, 0)
              .toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-2">
            Approved Today
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#10b981' }}>
            {withdrawals.filter((w) => w.status === 'Approved' && w.requestDate === today).length}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by user or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-48 px-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Withdrawals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 overflow-hidden md:block"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  ID
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  User
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Email
                </th>
                <th className="text-right p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Amount
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Date
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((withdrawal, index) => (
                <motion.tr
                  key={withdrawal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    #{withdrawal.id.toString().padStart(5, '0')}
                  </td>
                  <td className="p-4" style={{ color: '#ffffff' }}>
                    {withdrawal.userName}
                  </td>
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {withdrawal.userEmail}
                  </td>
                  <td className="p-4 text-right font-heading" style={{ fontSize: '16px', color: '#c9a84c' }}>
                    ${withdrawal.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                    {withdrawal.requestDate}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        withdrawal.status === 'Pending'
                          ? 'bg-[#c9a84c]/20 text-[#c9a84c]'
                          : withdrawal.status === 'Approved'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}
                      style={{ fontSize: '14px' }}
                    >
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {withdrawal.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(withdrawal.id)}
                            className="p-2 rounded bg-[#10b981]/20 hover:bg-[#10b981]/30 transition-all"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4 text-[#10b981]" />
                          </button>
                          <button
                            onClick={() => handleReject(withdrawal.id)}
                            className="p-2 rounded bg-[#ef4444]/20 hover:bg-[#ef4444]/30 transition-all"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 text-[#ef4444]" />
                          </button>
                        </>
                      )}
                      {withdrawal.status !== 'Pending' && (
                        <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>-</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="space-y-3 md:hidden">
        {filteredWithdrawals.length > 0 ? (
          filteredWithdrawals.map((withdrawal, index) => (
            <motion.div
              key={withdrawal.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#141e32]/70 to-[#0a0e1a]/70 p-4 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-white">{withdrawal.userName}</div>
                  <div className="mt-1 truncate text-sm text-white/50">{withdrawal.userEmail}</div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                    withdrawal.status === 'Pending'
                      ? 'bg-[#c9a84c]/20 text-[#c9a84c]'
                      : withdrawal.status === 'Approved'
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : 'bg-[#ef4444]/20 text-[#ef4444]'
                  }`}
                >
                  {withdrawal.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-xs text-white/50">Amount</div>
                  <div className="mt-1 font-heading text-[#c9a84c]">${withdrawal.amount.toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-xs text-white/50">Requested</div>
                  <div className="mt-1 text-sm text-white">{withdrawal.requestDate}</div>
                </div>
              </div>
              {withdrawal.status === 'Pending' && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApprove(withdrawal.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10b981]/20 px-4 py-3 text-[#10b981]"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(withdrawal.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ef4444]/20 px-4 py-3 text-[#ef4444]"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="rounded-xl border border-[#c9a84c]/20 bg-[#141e32]/70 p-8 text-center text-white/60">
            No withdrawal requests found.
          </div>
        )}
      </div>
    </div>
  );
}
