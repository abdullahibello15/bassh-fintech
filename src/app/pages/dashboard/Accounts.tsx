import { Wallet, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../../context/AppContext';

export function Accounts() {
  const { currentUser } = useAppContext();

  const accounts = [
    {
      id: 1,
      name: 'Savings Account',
      type: 'Savings',
      balance: currentUser ? currentUser.balance * 0.68 : 0,
      growth: '+8.2%',
      accountNumber: '****5678',
    },
    {
      id: 2,
      name: 'Current Account',
      type: 'Current',
      balance: currentUser ? currentUser.balance * 0.32 : 0,
      growth: '+5.1%',
      accountNumber: '****1234',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: 'clamp(30px, 9vw, 36px)', color: '#ffffff' }}>
          Accounts
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage your accounts</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01, boxShadow: '0 0 30px rgba(201, 168, 76, 0.3)' }}
            className="p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-1">
                  {account.type}
                </div>
                <h3 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
                  {account.name}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#c9a84c]" />
              </div>
            </div>

            <div className="mb-4">
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-1">
                Balance
              </div>
              <div className="font-heading break-words" style={{ fontSize: 'clamp(28px, 9vw, 36px)', color: '#ffffff' }}>
                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                {account.accountNumber}
              </div>
              <div className="flex items-center gap-1" style={{ color: '#10b981' }}>
                <TrendingUp className="w-4 h-4" />
                <span>{account.growth}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
