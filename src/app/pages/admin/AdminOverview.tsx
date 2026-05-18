import { Users, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../../context/AppContext';

export function AdminOverview() {
  const { users, transactions, withdrawals, messages } = useAppContext();

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'Pending').length;
  const totalTransactionValue = transactions
    .filter(t => t.status === 'Completed' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, change: `${activeUsers} active`, color: '#c9a84c' },
    { label: 'Total Balance', value: `$${totalBalance.toLocaleString()}`, icon: DollarSign, change: `${users.length} users`, color: '#10b981' },
    { label: 'Pending Withdrawals', value: pendingWithdrawals.toString(), icon: CreditCard, change: `${withdrawals.length} total`, color: '#3b82f6' },
    { label: 'Total Deposits', value: `$${totalTransactionValue.toLocaleString()}`, icon: TrendingUp, change: `${transactions.length} transactions`, color: '#c9a84c' },
  ];

  const recentActivity = [
    ...withdrawals.slice(0, 2).map(w => ({
      user: w.userName,
      action: 'Withdrawal Request',
      amount: `$${w.amount.toLocaleString()}`,
      time: w.requestDate,
      status: w.status
    })),
    ...transactions.slice(0, 3).map(t => ({
      user: users.find(u => u.id === t.userId)?.name || 'User',
      action: t.type,
      amount: `$${Math.abs(t.amount).toLocaleString()}`,
      time: `${t.date} ${t.time}`,
      status: t.status
    }))
  ].slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: 'clamp(30px, 9vw, 36px)', color: '#ffffff' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
              <div className="px-2 py-1 rounded bg-white/10 text-white/70" style={{ fontSize: '12px' }}>
                {stat.change}
              </div>
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-1">
              {stat.label}
            </div>
            <div className="font-heading" style={{ fontSize: '32px', color: '#ffffff' }}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
      >
        <h2 className="font-heading mb-6" style={{ fontSize: '24px', color: '#ffffff' }}>
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex flex-col gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div style={{ color: '#ffffff' }}>{activity.user}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{activity.action}</div>
                </div>
                <div className="text-right">
                  <div style={{ color: '#c9a84c' }}>{activity.amount}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>{activity.time}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-4 rounded-lg bg-white/5 text-center" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              No recent activity.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
