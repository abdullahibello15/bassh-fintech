import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, Mail, Lock, User, Eye, EyeOff, Phone, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { ADMIN_CREDENTIALS } from "../auth/adminCredentials";
import { persistAuthToken, signupUser } from "../auth/authApi";

export function Signup() {
  const { upsertUser, setCurrentUser, users } = useAppContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage("Please agree to the terms and conditions.");
      return;
    }
    if (normalizedEmail === ADMIN_CREDENTIALS.email) {
      setErrorMessage("This email is reserved for admin access.");
      return;
    }
    if (users.find((u) => u.email.toLowerCase() === normalizedEmail)) {
      setErrorMessage("Email already exists.");
      return;
    }

    setIsLoading(true);

    try {
      const { user, token } = await signupUser({
        name: trimmedName,
        email: normalizedEmail,
        phone: trimmedPhone,
        password,
      });
      persistAuthToken(token);
      const authenticatedUser = upsertUser(user);
      setCurrentUser(authenticatedUser);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create your account."
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
            Create Account
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Start your journey with us
          </p>
        </div>

        {/* Signup Form */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/80 to-[#0a0e1a]/80 backdrop-blur-xl border border-[#c9a84c]/20">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                className="block mb-2"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>
            </div>

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

            {/* Phone */}
            <div>
              <label
                className="block mb-2"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
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
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label
                className="block mb-2"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 mt-1 rounded border-[#c9a84c]/20"
              />
              <label
                style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}
              >
                I agree to the{" "}
                <a href="#" className="text-[#c9a84c] hover:text-[#b89640]">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#c9a84c] hover:text-[#b89640]">
                  Privacy Policy
                </a>
              </label>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-[#c9a84c] hover:text-[#b89640] transition-colors"
            >
              Sign in
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
