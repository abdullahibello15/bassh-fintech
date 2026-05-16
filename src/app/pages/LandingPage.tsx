import { Link } from "react-router";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  CreditCard,
  Clock,
  Globe,
  Users,
  Lock,
  CheckCircle,
} from "lucide-react";
import { motion } from "motion/react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-[#c9a84c]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#3b82f6] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#0a0e1a]" />
            </div>
            <span
              className="font-heading font-semibold"
              style={{ fontSize: "24px", color: "#c9a84c" }}
            >
              Trust
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-white/80 hover:text-[#c9a84c] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-white/80 hover:text-[#c9a84c] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#security"
              className="text-white/80 hover:text-[#c9a84c] transition-colors"
            >
              Security
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-white/80 hover:text-[#c9a84c] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="font-heading mb-6"
              style={{ fontSize: "64px", lineHeight: "1.1", color: "#ffffff" }}
            >
              Banking for the
              <span className="block bg-gradient-to-r from-[#c9a84c] to-[#3b82f6] bg-clip-text text-transparent">
                Digital Age
              </span>
            </h1>
            <p
              className="mb-10 mx-auto max-w-2xl"
              style={{ fontSize: "20px", color: "rgba(255, 255, 255, 0.7)" }}
            >
              Experience premium digital banking with cutting-edge security,
              instant transactions, and personalized financial insights.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105 flex items-center gap-2"
              >
                Open Account <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all hover:scale-105"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Floating Cards Animation */}
          <motion.div
            className="mt-20 relative h-[400px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#c9a84c]/20 via-[#3b82f6]/20 to-[#c9a84c]/20 blur-3xl" />
            <div className="relative h-full flex items-center justify-center">
              <div className="w-[400px] h-[250px] bg-gradient-to-br from-[#c9a84c] to-[#b89640] rounded-2xl shadow-2xl p-8 backdrop-blur-xl border border-[#c9a84c]/30">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-[#0a0e1a]/60 mb-2">
                      Account Balance
                    </div>
                    <div
                      className="text-[#0a0e1a] font-heading"
                      style={{ fontSize: "32px" }}
                    >
                      $0.00
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div
                        className="text-[#0a0e1a]/60 mb-1"
                        style={{ fontSize: "12px" }}
                      >
                        Card Holder
                      </div>
                      <div className="text-[#0a0e1a]">New Account</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#0a0e1a]/10 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#0a0e1a]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-heading mb-4"
              style={{ fontSize: "48px", color: "#ffffff" }}
            >
              Why Choose Us
            </h2>
            <p style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.7)" }}>
              Powerful features designed for modern banking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Bank-Grade Security",
                description:
                  "Military-grade encryption and multi-factor authentication protect your assets 24/7.",
              },
              {
                icon: TrendingUp,
                title: "Real-Time Analytics",
                description:
                  "Track your spending, investments, and financial goals with intelligent insights.",
              },
              {
                icon: Clock,
                title: "Instant Transfers",
                description:
                  "Send and receive money instantly with zero fees to other platform users.",
              },
              {
                icon: Globe,
                title: "Global Access",
                description:
                  "Manage your finances from anywhere with our mobile-first platform.",
              },
              {
                icon: CreditCard,
                title: "Virtual Cards",
                description:
                  "Create unlimited virtual cards for online purchases with spending limits.",
              },
              {
                icon: Users,
                title: "24/7 Support",
                description:
                  "Get help anytime with our dedicated customer support team.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all hover:scale-105"
              >
                <feature.icon className="w-12 h-12 text-[#c9a84c] mb-4" />
                <h3
                  className="font-heading mb-3"
                  style={{ fontSize: "24px", color: "#ffffff" }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-6 bg-gradient-to-br from-[#141e32]/40 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-heading mb-4"
              style={{ fontSize: "48px", color: "#ffffff" }}
            >
              Get Started in Minutes
            </h2>
            <p style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.7)" }}>
              Simple steps to open your account
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up with your email in under 2 minutes",
              },
              {
                step: "02",
                title: "Verify Identity",
                description: "Quick and secure identity verification",
              },
              {
                step: "03",
                title: "Fund Account",
                description: "Add funds via bank transfer or card",
              },
              {
                step: "04",
                title: "Start Banking",
                description: "Enjoy full access to all features",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b89640] flex items-center justify-center">
                  <span
                    className="font-heading"
                    style={{ fontSize: "28px", color: "#0a0e1a" }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3
                  className="font-heading mb-2"
                  style={{ fontSize: "20px", color: "#ffffff" }}
                >
                  {item.title}
                </h3>
                <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="font-heading mb-6"
                style={{ fontSize: "48px", color: "#ffffff" }}
              >
                Your Security is Our Priority
              </h2>
              <p
                className="mb-8"
                style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.7)" }}
              >
                We employ the latest security technologies to ensure your funds
                and data are always protected.
              </p>
              <div className="space-y-4">
                {[
                  "256-bit SSL encryption",
                  "Two-factor authentication",
                  "Biometric login support",
                  "Real-time fraud detection",
                  "FDIC insured up to $250,000",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#c9a84c]" />
                    <span style={{ color: "#ffffff" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/20 to-[#3b82f6]/20 blur-3xl" />
              <div className="relative p-12 rounded-2xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20">
                <Lock className="w-32 h-32 mx-auto text-[#c9a84c]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-2xl bg-gradient-to-br from-[#c9a84c]/20 to-[#3b82f6]/20 backdrop-blur-xl border border-[#c9a84c]/40">
            <h2
              className="font-heading mb-6"
              style={{ fontSize: "48px", color: "#ffffff" }}
            >
              Ready to Get Started?
            </h2>
            <p
              className="mb-8"
              style={{ fontSize: "20px", color: "rgba(255, 255, 255, 0.7)" }}
            >
              Join thousands of satisfied customers and experience the future of
              banking today.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
            >
              Open Your Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#c9a84c]/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#3b82f6] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#0a0e1a]" />
                </div>
                <span
                  className="font-heading"
                  style={{ fontSize: "20px", color: "#c9a84c" }}
                >
                  Trust
                </span>
              </div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Premium digital banking for the modern world.
              </p>
            </div>
            <div>
              <h4 className="font-heading mb-4" style={{ color: "#ffffff" }}>
                Product
              </h4>
              <div className="space-y-2">
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    Features
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    Pricing
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    Security
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-heading mb-4" style={{ color: "#ffffff" }}>
                Company
              </h4>
              <div className="space-y-2">
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    About
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    Careers
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-heading mb-4" style={{ color: "#ffffff" }}>
                Legal
              </h4>
              <div className="space-y-2">
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    Privacy
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    Terms
                  </a>
                </div>
                <div>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#c9a84c] transition-colors"
                  >
                    Compliance
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            className="pt-8 border-t border-[#c9a84c]/20 text-center"
            style={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            © 2020 Trust Recovery. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
