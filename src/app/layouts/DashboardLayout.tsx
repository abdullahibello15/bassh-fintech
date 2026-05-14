import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircle,
  ArrowLeftRight,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fetchUser, fetchUserById } from "../api/usersApi";
import { useAppContext, UserType } from "../context/AppContext";

const BALANCE_POLL_INTERVAL_MS = 10000;

const clearCachedSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("users");
};

const getStoredUser = () => {
  const savedUser = localStorage.getItem("currentUser");
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser) as UserType;
  } catch {
    return null;
  }
};

const getTokenUserId = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    const userId =
      payload.id ||
      payload._id ||
      payload.userId ||
      payload.user_id ||
      payload.sub;

    return userId ? String(userId) : "";
  } catch {
    return "";
  }
};

const getUserId = (user: UserType | null, token: string) => {
  const storedUser = getStoredUser();
  const userId =
    user?.apiId ||
    (user?.id ? String(user.id) : "") ||
    storedUser?.apiId ||
    (storedUser?.id ? String(storedUser.id) : "") ||
    getTokenUserId(token);

  return {
    userId,
    fallbackUser: user || storedUser || undefined,
  };
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, upsertUser } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        clearCachedSession();
        setCurrentUser(null);
        navigate("/login", { replace: true });
        return;
      }

      const { userId, fallbackUser } = getUserId(currentUser, token);

      if (!userId) {
        clearCachedSession();
        setCurrentUser(null);
        navigate("/login", { replace: true });
        return;
      }

      try {
        const latestUser = await fetchUserById(userId, fallbackUser);
        if (!isMounted) return;

        const nextUser = upsertUser(latestUser);
        setCurrentUser(nextUser);
        setIsCheckingAuth(false);
      } catch (error) {
        if (!isMounted) return;

        console.error("Unable to restore authenticated user", error);
        clearCachedSession();
        setCurrentUser(null);
        navigate("/login", { replace: true });
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.apiId, currentUser?.id, navigate]);

  useEffect(() => {
    if (isCheckingAuth || !currentUser) return;

    let isMounted = true;

    const loadLatestUserFromDatabase = async () => {
      try {
        const latestUser = await fetchUser(currentUser);
        if (isMounted) {
          upsertUser(latestUser);
        }
      } catch (error) {
        console.error("Unable to refresh user balance from database", error);
        clearCachedSession();
        setCurrentUser(null);
        navigate("/login", { replace: true });
      }
    };

    loadLatestUserFromDatabase();
    const intervalId = window.setInterval(
      loadLatestUserFromDatabase,
      BALANCE_POLL_INTERVAL_MS
    );

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [currentUser?.apiId, currentUser?.id, isCheckingAuth, navigate]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/accounts", label: "Accounts", icon: Wallet },
    {
      path: "/dashboard/transactions",
      label: "Transactions",
      icon: ArrowLeftRight,
    },
    { path: "/dashboard/cards", label: "Cards", icon: CreditCard },
    { path: "/dashboard/support", label: "Support", icon: MessageCircle },
    { path: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    setCurrentUser(null);
    clearCachedSession();
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a] flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-[#c9a84c]/20 bg-[#141e32]/70 px-6 py-4 text-white/80">
          <Loader2 className="w-5 h-5 animate-spin text-[#c9a84c]" />
          <span>Loading account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[#141e32]/80 backdrop-blur-xl border border-[#c9a84c]/20 text-white"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 h-screen w-64 p-6 bg-[#0f1423]/80 backdrop-blur-xl border-r border-[#c9a84c]/20 z-40"
          >
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#3b82f6] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#0a0e1a]" />
              </div>
              <span
                className="font-heading"
                style={{ fontSize: "24px", color: "#c9a84c" }}
              >
                Fintech
              </span>
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
                        ? "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
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
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
