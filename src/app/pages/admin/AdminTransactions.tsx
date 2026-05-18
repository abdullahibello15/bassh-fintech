import { Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

export function AdminTransactions() {
  const { transactions, users } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTransactions = transactions.filter((t) => {
    const user = users.find(u => u.id === t.userId);
    const matchesSearch = user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === 'all' || t.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: 'clamp(30px, 9vw, 36px)', color: '#ffffff' }}>
          Transactions Monitoring
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Monitor all platform transactions</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full md:w-48 px-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-48 px-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
                  Date & Time
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Type
                </th>
                <th className="text-right p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Amount
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    #{transaction.id.toString().padStart(5, '0')}
                  </td>
                  <td className="p-4" style={{ color: '#ffffff' }}>
                    {users.find(u => u.id === transaction.userId)?.name || 'Unknown'}
                  </td>
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {transaction.date} {transaction.time}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? 'bg-[#10b981]/20' : 'bg-[#ef4444]/20'
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <ArrowDownRight className="w-3 h-3 text-[#10b981]" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-[#ef4444]" />
                        )}
                      </div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{transaction.type}</span>
                    </div>
                  </td>
                  <td
                    className="p-4 text-right font-heading"
                    style={{
                      fontSize: '16px',
                      color: transaction.amount > 0 ? '#10b981' : '#ef4444',
                    }}
                  >
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        transaction.status === 'Completed'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : transaction.status === 'Pending'
                          ? 'bg-[#c9a84c]/20 text-[#c9a84c]'
                          : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}
                      style={{ fontSize: '14px' }}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="space-y-3 md:hidden">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction, index) => {
            const userName = users.find(u => u.id === transaction.userId)?.name || 'Unknown';
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#141e32]/70 to-[#0a0e1a]/70 p-4 backdrop-blur-xl"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-white">{userName}</div>
                    <div className="mt-1 text-sm text-white/50">
                      #{transaction.id.toString().padStart(5, '0')} · {transaction.date}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                      transaction.status === 'Completed'
                        ? 'bg-[#10b981]/20 text-[#10b981]'
                        : transaction.status === 'Pending'
                        ? 'bg-[#c9a84c]/20 text-[#c9a84c]'
                        : 'bg-[#ef4444]/20 text-[#ef4444]'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-white/70">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        transaction.amount > 0 ? 'bg-[#10b981]/20' : 'bg-[#ef4444]/20'
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <ArrowDownRight className="h-4 w-4 text-[#10b981]" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-[#ef4444]" />
                      )}
                    </div>
                    {transaction.type}
                  </div>
                  <div
                    className="font-heading"
                    style={{ color: transaction.amount > 0 ? '#10b981' : '#ef4444' }}
                  >
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-xl border border-[#c9a84c]/20 bg-[#141e32]/70 p-8 text-center text-white/60">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
