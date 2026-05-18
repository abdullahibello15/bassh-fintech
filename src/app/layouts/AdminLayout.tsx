import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, Users, CreditCard, DollarSign, Settings, LogOut, Menu, X, Shield, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

export function AdminLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/admin/withdrawals', label: 'Withdrawals', icon: DollarSign },
    { path: '/admin/messages', label: 'Messages', icon: MessageCircle },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl bg-[#141e32]/90 backdrop-blur-xl border border-[#c9a84c]/20 text-white shadow-lg shadow-black/20"
        aria-label="Toggle admin navigation"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className="fixed inset-x-0 top-0 z-30 h-16 border-b border-[#c9a84c]/15 bg-[#0a0e1a]/85 backdrop-blur-xl md:hidden" />
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-0 h-screen w-[82vw] max-w-72 p-6 bg-[#0f1423]/95 backdrop-blur-xl border-r border-[#c9a84c]/20 z-40 shadow-2xl shadow-black/30 md:block md:w-64 md:max-w-none md:bg-[#0f1423]/80 md:shadow-none ${
          isSidebarOpen ? 'block' : 'hidden md:block'
        }`}
      >
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#3b82f6] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0a0e1a]" />
              </div>
              <div>
                <div className="font-heading" style={{ fontSize: '20px', color: '#c9a84c' }}>
                  Admin
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Back Office
                </div>
              </div>
            </div>

            <nav className="space-y-2 mb-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </div>
      </motion.aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen px-4 pb-6 pt-24 sm:px-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
