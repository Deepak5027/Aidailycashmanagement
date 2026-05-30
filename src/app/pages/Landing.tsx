import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Wallet,
  ArrowRight,
  Shield,
  TrendingUp,
  Scan,
  Bell,
  BarChart3,
  Mic,
  Zap,
  Target,
  Star,
  ChevronDown,
  Bot,
  Sparkles,
  Activity,
  PieChart,
  CreditCard,
  Home,
  GraduationCap,
  Briefcase,
  Users,
  CheckCircle2,
  Play,
  Globe,
  Lock,
  X,
  Menu,
} from "lucide-react";

// Animated counter hook
function useCounter(target: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return count;
}

const userModes = [
  {
    id: "business",
    label: "Business Owner",
    icon: Briefcase,
    color: "#10b981",
    tagline: "Profit-driven financial control",
    features: [
      "Profit & loss analytics dashboard",
      "Supplier expense tracking",
      "Salary & payroll management",
      "GST / tax estimate cards",
      "Business cash flow forecasting",
      "Vendor payment scheduling",
    ],
    stats: [
      { label: "Avg. Monthly Savings", value: "₹28,400" },
      { label: "Tax Accuracy", value: "99.2%" },
      { label: "Time Saved/mo", value: "14 hrs" },
    ],
  },
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    color: "#3b82f6",
    tagline: "Smart money for smarter futures",
    features: [
      "Pocket money tracker & budget",
      "Subscription monitor & alerts",
      "Food & dining spend analysis",
      "Savings challenge gamification",
      "Expense splitting with friends",
      "Study material budget planner",
    ],
    stats: [
      { label: "Avg. Monthly Savings", value: "₹3,200" },
      { label: "Overspend Prevented", value: "84%" },
      { label: "Goals Achieved", value: "91%" },
    ],
  },
  {
    id: "housewife",
    label: "Home Manager",
    icon: Home,
    color: "#f59e0b",
    tagline: "Run your household like a CFO",
    features: [
      "Grocery budgeting & smart lists",
      "Household expense management",
      "Electricity & gas bill reminders",
      "Family savings planner",
      "School fees & activity tracker",
      "Festival & occasion fund goals",
    ],
    stats: [
      { label: "Avg. Monthly Savings", value: "₹6,800" },
      { label: "Bill Reminders", value: "100%" },
      { label: "Family Goals Met", value: "88%" },
    ],
  },
  {
    id: "freelancer",
    label: "Freelancer",
    icon: Users,
    color: "#7c3aed",
    tagline: "Irregular income, total clarity",
    features: [
      "Variable income smoothing",
      "Client invoice tracking",
      "Quarterly advance tax reminders",
      "Project profitability analysis",
      "Emergency fund AI guidance",
      "Skill investment ROI tracker",
    ],
    stats: [
      { label: "Avg. Monthly Savings", value: "₹11,600" },
      { label: "Tax Filing Accuracy", value: "97%" },
      { label: "Income Predictability", value: "+62%" },
    ],
  },
];

const aiFeatures = [
  {
    icon: Bot,
    title: "Conversational AI Assistant",
    description: "Ask anything about your money. Get instant, personalized answers powered by GPT-4 financial intelligence.",
    color: "#10b981",
    glow: "rgba(16,185,129,0.15)",
  },
  {
    icon: Activity,
    title: "Predictive Overspend Alert",
    description: "AI forecasts category overruns 5 days early so you can course-correct before it happens.",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
  },
  {
    icon: Scan,
    title: "OCR Receipt Intelligence",
    description: "Snap a receipt — AI extracts merchant, amount, category, and GST in under 2 seconds.",
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.15)",
  },
  {
    icon: Mic,
    title: "Voice Expense Entry",
    description: '"Spent 340 on groceries" — just say it. AI transcribes, categorizes, and logs it instantly.',
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    icon: PieChart,
    title: "Behavioral Spend Analysis",
    description: "ML detects your spending patterns, emotional triggers, and gives weekly behavioral insights.",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.15)",
  },
  {
    icon: Shield,
    title: "Real-Time Fraud Detection",
    description: "Anomaly detection flags unusual transactions instantly — before your bank does.",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.15)",
  },
];

const testimonials = [
  {
    name: "Riya Sharma",
    role: "Startup Founder, Bangalore",
    avatar: "RS",
    color: "#10b981",
    text: "FinanceAI completely changed how I run my business finances. The GST tracker alone saves me 8 hours every month. The AI insights are scarily accurate.",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Engineering Student, Mumbai",
    avatar: "AM",
    color: "#3b82f6",
    text: "I used to run out of money by the 20th of every month. Now the AI alerts me when I am about to overspend on food delivery. Game changer for students.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Homemaker, Chennai",
    avatar: "PN",
    color: "#f59e0b",
    text: "Managing a family of 5 on a budget felt impossible. FinanceAI's household mode organized everything. We saved ₹12,000 in the first month.",
    rating: 5,
  },
  {
    name: "Karthik Reddy",
    role: "Freelance Designer, Hyderabad",
    avatar: "KR",
    color: "#7c3aed",
    text: "Irregular income made tax season a nightmare. The quarterly tax estimator and invoice tracker are exactly what every freelancer needs.",
    rating: 5,
  },
];

export default function Landing() {
  const [activeMode, setActiveMode] = useState("business");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const users = useCounter(50000, 2200, heroVisible);
  const fraudPrevented = useCounter(2, 2000, heroVisible);
  const savedAmount = useCounter(48, 2400, heroVisible);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const activeModeDef = userModes.find((m) => m.id === activeMode)!;

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#080c14", fontFamily: "'Outfit', 'Inter', sans-serif" }}
    >
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: 600,
            height: 600,
            top: -200,
            left: -200,
            background: "radial-gradient(circle, #10b981, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-15"
          style={{
            width: 500,
            height: 500,
            top: 100,
            right: -150,
            background: "radial-gradient(circle, #7c3aed, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: 400,
            height: 400,
            bottom: 200,
            left: "40%",
            background: "radial-gradient(circle, #3b82f6, transparent 70%)",
          }}
        />
      </div>

      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(8, 12, 20, 0.8)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}
              >
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: "#e8edf5", letterSpacing: "-0.02em" }}>
                Finance<span style={{ color: "#10b981" }}>AI</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "User Modes", "Pricing", "Security"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium transition-colors"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#10b981")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#94a3b8")}
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
                style={{ color: "#94a3b8" }}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(16,185,129,0.3)",
                }}
              >
                Start Free
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: "#94a3b8" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-2"
            style={{ background: "#0a0f1e", borderColor: "rgba(255,255,255,0.06)" }}
          >
            {["Features", "User Modes", "Pricing", "Security"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="block px-4 py-3 rounded-lg text-sm font-medium"
                style={{ color: "#94a3b8" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                className="block text-center py-2.5 rounded-xl text-sm font-medium"
                style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="block text-center py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-24 pb-32 px-4"
        style={{ zIndex: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-20">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#10b981",
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>India's #1 AI-Powered Financial Intelligence Platform</span>
            </div>

            <h1
              className="font-black leading-none mb-6"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                letterSpacing: "-0.04em",
                color: "#e8edf5",
              }}
            >
              Your Money,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Finally Intelligent
              </span>
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
              style={{ color: "#6b7ca0" }}
            >
              FinanceAI combines real-time AI, OCR receipt scanning, voice input, fraud detection,
              and behavioral analytics — built for Indian families, students, freelancers, and businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  boxShadow: "0 0 40px rgba(16,185,129,0.35), 0 4px 24px rgba(0,0,0,0.3)",
                }}
              >
                Start Managing Smartly
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e8edf5",
                }}
              >
                <Play className="w-4 h-4" />
                Live Demo
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { value: `${users.toLocaleString()}+`, label: "Active Users", color: "#10b981" },
              { value: `₹${fraudPrevented}Cr+`, label: "Fraud Prevented", color: "#3b82f6" },
              { value: `₹${savedAmount}Cr+`, label: "Total Savings", color: "#7c3aed" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="text-3xl font-black mb-1"
                  style={{ color: stat.color, fontFamily: "'Geist Mono', monospace" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: "#6b7ca0" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative px-4 pb-24" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden p-px"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(59,130,246,0.2), rgba(124,58,237,0.3))",
              boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(16,185,129,0.1)",
            }}
          >
            <div
              className="rounded-3xl p-6"
              style={{ background: "#0a0f1e" }}
            >
              {/* Fake dashboard mockup */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
                <div
                  className="flex-1 h-6 rounded-lg ml-2"
                  style={{ background: "rgba(255,255,255,0.04)", maxWidth: 300 }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Net Balance", value: "₹2,84,320", change: "+12.4%", color: "#10b981" },
                  { label: "Monthly Income", value: "₹95,000", change: "+8.2%", color: "#3b82f6" },
                  { label: "Expenses", value: "₹41,240", change: "-3.1%", color: "#f59e0b" },
                  { label: "Health Score", value: "87/100", change: "Excellent", color: "#7c3aed" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-xs mb-2" style={{ color: "#6b7ca0" }}>{card.label}</div>
                    <div className="text-lg font-bold mb-1" style={{ color: "#e8edf5", fontFamily: "'Geist Mono', monospace" }}>
                      {card.value}
                    </div>
                    <div className="text-xs font-medium" style={{ color: card.color }}>{card.change}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  className="md:col-span-2 rounded-2xl p-4 h-28 flex items-end gap-1"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-xs mb-2 w-full" style={{ color: "#6b7ca0" }}>Spending Trend</div>
                  {[40, 65, 45, 80, 55, 70, 48, 90, 62, 75, 55, 85].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        background: i === 11
                          ? "linear-gradient(to top, #10b981, #34d399)"
                          : "rgba(16,185,129,0.2)",
                      }}
                    />
                  ))}
                </div>
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-xs mb-3" style={{ color: "#6b7ca0" }}>AI Insight</div>
                  <div
                    className="text-xs leading-relaxed p-3 rounded-xl"
                    style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)" }}
                  >
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    You can save ₹4,200 this month by reducing food delivery by 30%. On track for your vacation goal!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Modes Section */}
      <section id="user-modes" className="relative py-24 px-4" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#7c3aed" }}
            >
              <Users className="w-4 h-4" />
              Personalized Modes
            </div>
            <h2
              className="font-black mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#e8edf5", letterSpacing: "-0.03em" }}
            >
              Built for your financial life
            </h2>
            <p style={{ color: "#6b7ca0", maxWidth: 520, margin: "0 auto" }}>
              FinanceAI adapts its intelligence to your specific situation — not a one-size-fits-all tool.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {userModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all"
                  style={{
                    background: isActive ? `${mode.color}18` : "rgba(255,255,255,0.03)",
                    border: isActive ? `1px solid ${mode.color}40` : "1px solid rgba(255,255,255,0.06)",
                    color: isActive ? mode.color : "#6b7ca0",
                    boxShadow: isActive ? `0 0 20px ${mode.color}20` : "none",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Mode Content */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div
              className="rounded-3xl p-8"
              style={{
                background: `linear-gradient(135deg, ${activeModeDef.color}08 0%, rgba(8,12,20,0.9) 100%)`,
                border: `1px solid ${activeModeDef.color}20`,
                boxShadow: `0 0 60px ${activeModeDef.color}10`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${activeModeDef.color}18`, border: `1px solid ${activeModeDef.color}30` }}
                >
                  <activeModeDef.icon className="w-6 h-6" style={{ color: activeModeDef.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "#e8edf5" }}>{activeModeDef.label} Mode</h3>
                  <p className="text-sm" style={{ color: activeModeDef.color }}>{activeModeDef.tagline}</p>
                </div>
              </div>
              <ul className="space-y-3 mt-6">
                {activeModeDef.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "#94a3b8" }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: activeModeDef.color }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activeModeDef.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-6 flex items-center justify-between"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: "#6b7ca0" }}>{stat.label}</span>
                  <span
                    className="text-2xl font-black"
                    style={{ color: activeModeDef.color, fontFamily: "'Geist Mono', monospace" }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-all"
                style={{
                  background: `linear-gradient(135deg, ${activeModeDef.color}, ${activeModeDef.color}cc)`,
                  color: "#fff",
                  boxShadow: `0 0 30px ${activeModeDef.color}30`,
                }}
              >
                Start {activeModeDef.label} Mode
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section id="features" className="py-24 px-4" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}
            >
              <Brain className="w-4 h-4" />
              AI-Powered Intelligence
            </div>
            <h2
              className="font-black mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#e8edf5", letterSpacing: "-0.03em" }}
            >
              Not a tracker. An AI co-pilot.
            </h2>
            <p style={{ color: "#6b7ca0", maxWidth: 480, margin: "0 auto" }}>
              Six layers of machine intelligence working 24/7 on your financial life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl p-6 group transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = feature.glow;
                    (e.currentTarget as HTMLElement).style.borderColor = `${feature.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}25` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "#e8edf5" }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b7ca0" }}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Tools Section */}
      <section className="py-24 px-4" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6" }}
              >
                <Zap className="w-4 h-4" />
                Advanced Tools
              </div>
              <h2
                className="font-black mb-6"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "#e8edf5", letterSpacing: "-0.03em" }}
              >
                Everything a serious financial life demands
              </h2>
              <div className="space-y-4">
                {[
                  { icon: BarChart3, title: "Spending Heatmap Calendar", desc: "See your entire year of spending in one glance — identify patterns instantly." },
                  { icon: Target, title: "Savings Goal Gamification", desc: "Badges, streaks, and milestones turn saving from chore to achievement." },
                  { icon: CreditCard, title: "EMI & Loan Planner", desc: "Model loan scenarios, track repayments, and minimize interest costs with AI guidance." },
                  { icon: TrendingUp, title: "Expense Prediction Graph", desc: "ML-powered forecasts of next month's spending by category with confidence bands." },
                  { icon: Globe, title: "Multi-currency Support", desc: "Track international expenses with live FX rates. Perfect for travelers and remote workers." },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4 items-start">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
                      >
                        <Icon className="w-5 h-5" style={{ color: "#3b82f6" }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm mb-1" style={{ color: "#e8edf5" }}>{item.title}</div>
                        <div className="text-sm" style={{ color: "#6b7ca0" }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gamification card mockup */}
            <div className="space-y-4">
              <div
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-sm" style={{ color: "#e8edf5" }}>Financial Health Score</div>
                  <div className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Excellent</div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "conic-gradient(#10b981 0% 87%, rgba(255,255,255,0.06) 87% 100%)",
                      padding: "3px",
                    }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center font-black text-xl"
                      style={{ background: "#080c14", color: "#10b981", fontFamily: "'Geist Mono', monospace" }}
                    >
                      87
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    {[
                      { label: "Savings Rate", val: 76 },
                      { label: "Debt-to-Income", val: 88 },
                      { label: "Emergency Fund", val: 60 },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-xs mb-1" style={{ color: "#6b7ca0" }}>
                          <span>{bar.label}</span><span style={{ color: "#10b981" }}>{bar.val}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${bar.val}%`, background: "linear-gradient(90deg, #10b981, #34d399)" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { emoji: "🏆", label: "Saver Pro", sub: "30-day streak" },
                  { emoji: "⚡", label: "Zero Overspend", sub: "This month" },
                  { emoji: "🎯", label: "Goal Crusher", sub: "3 goals done" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="rounded-2xl p-4 text-center"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-2xl mb-1">{badge.emoji}</div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "#e8edf5" }}>{badge.label}</div>
                    <div className="text-xs" style={{ color: "#6b7ca0" }}>{badge.sub}</div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}
              >
                <div className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "#10b981" }}>
                  <Bot className="w-4 h-4" />
                  AI Monthly Summary
                </div>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  This month you saved ₹18,400 — 22% more than last month. Your biggest win: cutting dining
                  by ₹3,200. Keep it up to hit your vacation goal 2 weeks early. 🎉
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 px-4" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 50%, rgba(124,58,237,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Shield className="w-12 h-12 mx-auto mb-6" style={{ color: "#10b981" }} />
            <h2
              className="font-black mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#e8edf5", letterSpacing: "-0.03em" }}
            >
              Bank-Grade Security
            </h2>
            <p className="text-base mb-12 max-w-xl mx-auto" style={{ color: "#6b7ca0" }}>
              Your financial data is encrypted, never sold, and guarded by the same standards as leading banks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Lock, title: "256-bit AES Encryption", desc: "All data encrypted in transit and at rest." },
                { icon: Shield, title: "RBI-Compliant Architecture", desc: "Built following India's data privacy standards." },
                { icon: Zap, title: "24/7 Fraud Monitoring", desc: "AI watches for anomalies around the clock." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: "#10b981" }} />
                    </div>
                    <h3 className="font-bold text-base mb-2" style={{ color: "#e8edf5" }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: "#6b7ca0" }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="font-black mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#e8edf5", letterSpacing: "-0.03em" }}
            >
              Loved by 50,000+ users
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#f59e0b" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#94a3b8" }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}30` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#e8edf5" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#6b7ca0" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-3xl p-12 md:p-16"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.08) 50%, rgba(124,58,237,0.1) 100%)",
              border: "1px solid rgba(16,185,129,0.2)",
              boxShadow: "0 0 80px rgba(16,185,129,0.08)",
            }}
          >
            <Sparkles className="w-12 h-12 mx-auto mb-6" style={{ color: "#10b981" }} />
            <h2
              className="font-black mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "#e8edf5", letterSpacing: "-0.03em" }}
            >
              Ready to start managing smartly?
            </h2>
            <p className="text-base mb-8" style={{ color: "#6b7ca0" }}>
              Free forever for personal use. No credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  boxShadow: "0 0 40px rgba(16,185,129,0.3)",
                }}
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e8edf5",
                }}
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12 px-4"
        style={{ borderColor: "rgba(255,255,255,0.06)", zIndex: 1, position: "relative" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}
                >
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg" style={{ color: "#e8edf5" }}>
                  Finance<span style={{ color: "#10b981" }}>AI</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7ca0", maxWidth: 280 }}>
                India's most intelligent personal finance platform — built for every financial journey.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "User Modes", "Pricing", "Security"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4" style={{ color: "#e8edf5" }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm transition-colors"
                        style={{ color: "#6b7ca0" }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#10b981")}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#6b7ca0")}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="flex flex-col md:flex-row justify-between items-center pt-8 border-t text-sm"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#6b7ca0" }}
          >
            <span>© 2026 FinanceAI. All rights reserved.</span>
            <span>Made with ♥ for Indian financial freedom</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
