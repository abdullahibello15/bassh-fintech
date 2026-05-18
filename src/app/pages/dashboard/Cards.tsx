import { useState } from "react";
import { CreditCard, Lock, Unlock } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../../context/AppContext";

export function Cards() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const { currentUser, transactions } = useAppContext();

  const userTransactions = currentUser
    ? transactions.filter((t) => t.userId === currentUser.id).slice(0, 4)
    : [];
  const cardHolderName = currentUser?.name.trim() || "User";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1
          className="font-heading mb-2"
          style={{ fontSize: "clamp(30px, 9vw, 36px)", color: "#ffffff" }}
        >
          Cards
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Manage your virtual cards
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Card */}
        <div className="perspective-1000 mb-8">
          <motion.div
            className="relative w-full h-52 cursor-pointer sm:h-56"
            onClick={() => setIsFlipped(!isFlipped)}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl p-5 sm:p-8 bg-gradient-to-br from-[#c9a84c] to-[#b89640] shadow-2xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#0a0e1a",
                        opacity: 0.7,
                      }}
                      className="mb-1"
                    >
                      Premium Card
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 h-7 rounded bg-[#0a0e1a]/20" />
                    </div>
                  </div>
                  <CreditCard className="w-12 h-12 text-[#0a0e1a] opacity-30" />
                </div>

                <div>
                  <div className="mb-4">
                    <div
                      className="font-heading tracking-wider"
                      style={{
                        fontSize: "clamp(18px, 5.6vw, 24px)",
                        color: "#0a0e1a",
                        letterSpacing: "0.15em",
                      }}
                    >
                      •••• •••• •••• 5678
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#0a0e1a",
                          opacity: 0.6,
                        }}
                        className="mb-1"
                      >
                        Card Holder
                      </div>
                      <div style={{ fontSize: "16px", color: "#0a0e1a" }}>
                        {cardHolderName}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#0a0e1a",
                          opacity: 0.6,
                        }}
                        className="mb-1"
                      >
                        Expires
                      </div>
                      <div style={{ fontSize: "16px", color: "#0a0e1a" }}>
                        12/28
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl p-5 sm:p-8 bg-gradient-to-br from-[#b89640] to-[#c9a84c] shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="h-full flex flex-col justify-between">
                <div className="h-12 bg-[#0a0e1a] -mx-5 mt-4 sm:-mx-8" />

                <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-white/90 h-10 rounded flex items-center justify-end px-4 mb-2">
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#0a0e1a",
                        fontFamily: "monospace",
                      }}
                    >
                      842
                    </span>
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "#0a0e1a", opacity: 0.7 }}
                    className="text-right"
                  >
                    CVV
                  </div>
                </div>

                <div
                  style={{ fontSize: "12px", color: "#0a0e1a", opacity: 0.6 }}
                >
                  This card is property of Fintech. If found, please return to
                  nearest branch.
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Card Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 mb-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3
                className="font-heading mb-1"
                style={{ fontSize: "20px", color: "#ffffff" }}
              >
                Card Status
              </h3>
              <p
                style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)" }}
              >
                {isFrozen
                  ? "Your card is currently frozen"
                  : "Your card is active"}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full ${
                isFrozen
                  ? "bg-[#3b82f6]/20 text-[#3b82f6]"
                  : "bg-[#10b981]/20 text-[#10b981]"
              }`}
            >
              {isFrozen ? "Frozen" : "Active"}
            </div>
          </div>

          <button
            onClick={() => setIsFrozen(!isFrozen)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#c9a84c]/20 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/30 transition-all"
          >
            {isFrozen ? (
              <Unlock className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            <span>{isFrozen ? "Unfreeze Card" : "Freeze Card"}</span>
          </button>
        </motion.div>

        {/* Card Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <h3
            className="font-heading mb-4"
            style={{ fontSize: "20px", color: "#ffffff" }}
          >
            Card Details
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col gap-1 py-3 border-b border-white/10 sm:flex-row sm:justify-between">
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Card Number
              </span>
              <span style={{ color: "#ffffff" }}>•••• •••• •••• 5678</span>
            </div>
            <div className="flex flex-col gap-1 py-3 border-b border-white/10 sm:flex-row sm:justify-between">
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Card Type
              </span>
              <span style={{ color: "#ffffff" }}>Premium Virtual</span>
            </div>
            <div className="flex flex-col gap-1 py-3 border-b border-white/10 sm:flex-row sm:justify-between">
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Spending Limit
              </span>
              <span style={{ color: "#ffffff" }}>$10,000 / month</span>
            </div>
            <div className="flex flex-col gap-1 py-3 border-b border-white/10 sm:flex-row sm:justify-between">
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Current Usage
              </span>
              <span style={{ color: "#ffffff" }}>$0.00</span>
            </div>
            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Available
              </span>
              <span style={{ color: "#10b981" }}>
                {" "}
                $
                {currentUser?.balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                }) || "0.00"}
              </span>
            </div>
          </div>

          <button className="w-full mt-6 px-6 py-3 rounded-lg bg-[#c9a84c] text-[#0a0e1a] hover:bg-[#b89640] transition-all hover:scale-105">
            Request New Card
          </button>
        </motion.div>
      </div>
    </div>
  );
}
