import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { WithdrawModal } from "../../components/WithdrawModal";
import { useAppContext } from "../../context/AppContext";
import { fetchUser } from "../../api/usersApi";

const BALANCE_POLL_INTERVAL_MS = 10000;

export function DashboardOverview() {
  const { currentUser, transactions, upsertUser } = useAppContext();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const userTransactions = currentUser
    ? transactions.filter((t) => t.userId === currentUser.id).slice(0, 4)
    : [];
  const firstName = currentUser?.name.trim().split(/\s+/)[0] || "User";

  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;

    const loadLatestUser = async () => {
      try {
        const latestUser = await fetchUser(currentUser);
        if (isMounted) {
          upsertUser(latestUser);
        }
      } catch (error) {
        console.error("Unable to refresh latest user balance", error);
      }
    };

    loadLatestUser();
    const intervalId = window.setInterval(
      loadLatestUser,
      BALANCE_POLL_INTERVAL_MS
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [currentUser?.apiId, currentUser?.id]);

  return (
    <div>
      <div className="mb-8">
        <h1
          className="font-heading mb-2"
          style={{ fontSize: "36px", color: "#ffffff" }}
        >
          Dashboard
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Welcome back, {firstName}
        </p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#b89640] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative">
          <div style={{ color: "#0a0e1a", opacity: 0.7 }} className="mb-2">
            Total Balance
          </div>
          <div
            className="font-heading mb-6"
            style={{ fontSize: "48px", color: "#0a0e1a" }}
          >
            $
            {currentUser?.balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }) || "0.00"}
          </div>
          <div
            className="flex items-center gap-2"
            style={{ color: "#0a0e1a", opacity: 0.8 }}
          >
            <TrendingUp className="w-5 h-5" />
            <span>+12.5% from last month</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all text-left"
        >
          <ArrowDownRight className="w-8 h-8 text-[#10b981] mb-3" />
          <div
            className="font-heading"
            style={{ fontSize: "18px", color: "#ffffff" }}
          >
            Deposit
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)" }}>
            Add funds to your account
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all text-left"
        >
          <ArrowUpRight className="w-8 h-8 text-[#3b82f6] mb-3" />
          <div
            className="font-heading"
            style={{ fontSize: "18px", color: "#ffffff" }}
          >
            Transfer
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)" }}>
            Send money to others
          </p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsWithdrawModalOpen(true)}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all text-left"
        >
          <ArrowUpRight className="w-8 h-8 text-[#c9a84c] mb-3" />
          <div
            className="font-heading"
            style={{ fontSize: "18px", color: "#ffffff" }}
          >
            Withdraw
          </div>
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)" }}>
            Request withdrawal
          </p>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Savings Account
            </div>
            <Wallet className="w-5 h-5 text-[#c9a84c]" />
          </div>
          <div
            className="font-heading"
            style={{ fontSize: "28px", color: "#ffffff" }}
          >
            $
            {currentUser?.balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }) || "0.00"}
          </div>
          <div
            className="flex items-center gap-1 mt-2"
            style={{ color: "#10b981", fontSize: "14px" }}
          >
            <TrendingUp className="w-4 h-4" />
            <span>+8.2%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Current Account
            </div>
            <CreditCard className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div
            className="font-heading"
            style={{ fontSize: "28px", color: "#ffffff" }}
          >
            $0.00
          </div>
          <div
            className="flex items-center gap-1 mt-2"
            style={{ color: "#10b981", fontSize: "14px" }}
          >
            <TrendingUp className="w-4 h-4" />
            <span>+5.1%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div style={{ color: "rgba(255, 255, 255, 0.7)" }}>Total Spent</div>
            <DollarSign className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div
            className="font-heading"
            style={{ fontSize: "28px", color: "#ffffff" }}
          >
            $0.00
          </div>
          <div
            className="flex items-center gap-1 mt-2"
            style={{ color: "#ef4444", fontSize: "14px" }}
          >
            <TrendingDown className="w-4 h-4" />
            <span>This month</span>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
      >
        <h2
          className="font-heading mb-6"
          style={{ fontSize: "24px", color: "#ffffff" }}
        >
          Recent Transactions
        </h2>
        <div className="space-y-4">
          {userTransactions.length > 0 ? (
            userTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount > 0
                        ? "bg-[#10b981]/20"
                        : "bg-[#ef4444]/20"
                    }`}
                  >
                    {transaction.amount > 0 ? (
                      <ArrowDownRight className="w-5 h-5 text-[#10b981]" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-[#ef4444]" />
                    )}
                  </div>
                  <div>
                    <div style={{ color: "#ffffff" }}>
                      {transaction.description}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      {transaction.date} {transaction.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-heading"
                    style={{
                      fontSize: "18px",
                      color: transaction.amount > 0 ? "#10b981" : "#ef4444",
                    }}
                  >
                    {transaction.amount > 0 ? "+" : ""}$
                    {Math.abs(transaction.amount).toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="text-center py-8"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              No recent transactions
            </div>
          )}
        </div>
      </motion.div>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
}
