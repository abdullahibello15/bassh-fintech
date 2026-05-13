import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { ADMIN_CREDENTIALS } from "../auth/adminCredentials";
import { loginUser, persistAuthToken } from "../auth/authApi";

export function Login() {
  const { upsertUser, setCurrentUser } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const isLocalAdminLogin =
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password;

  const navigateAfterLoading = (path: string, delay = 0) => {
    setIsLoading(true);
    window.setTimeout(() => {
      navigate(path);
    }, delay);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const normalizedEmail = email.trim().toLowerCase();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const { user, token, isAdmin } = await loginUser(normalizedEmail, password);
      persistAuthToken(token);

      if (isAdmin || normalizedEmail === ADMIN_CREDENTIALS.email) {
        setCurrentUser(null);
        navigateAfterLoading("/admin");
        return;
      }

      if (user.status === "Suspended") {
        persistAuthToken();
        setCurrentUser(null);
        setErrorMessage("Your account is suspended. Please contact support.");
        setIsLoading(false);
        return;
      }

      const authenticatedUser = upsertUser(user);
      setCurrentUser(authenticatedUser);
      navigateAfterLoading("/dashboard");
    } catch (error) {
      if (isLocalAdminLogin) {
        persistAuthToken();
        setCurrentUser(null);
        navigateAfterLoading("/admin");
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : "Invalid credentials."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a] flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#3b82f6] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#0a0e1a]" />
            </div>
            <span
              className="font-heading"
              style={{ fontSize: "28px", color: "#c9a84c" }}
            >
              Fintech
            </span>
          </Link>
          <h1
            className="font-heading mb-2"
            style={{ fontSize: "32px", color: "#ffffff" }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/80 to-[#0a0e1a]/80 backdrop-blur-xl border border-[#c9a84c]/20">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block mb-2"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block mb-2"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-[#c9a84c]/20"
                />
                <span
                  style={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-[#c9a84c] hover:text-[#b89640] transition-colors"
                style={{ fontSize: "14px" }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Don't have an account?{" "}
            </span>
            <Link
              to="/signup"
              className="text-[#c9a84c] hover:text-[#b89640] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-white/60 hover:text-[#c9a84c] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
