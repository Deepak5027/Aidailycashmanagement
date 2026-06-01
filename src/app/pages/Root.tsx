import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  AlertTriangle,
  ScanLine,
  BarChart3,
  User,
  Menu,
  X,
  Mic,
  Brain,
  Target,
  Bot,
  Upload,
  Bell,
  Search,
  Sparkles,
  ChevronDown,
  Calculator as CalcIcon,
  TrendingUp,
  WifiOff,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { RoleProvider } from "../contexts/RoleContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", path: "/app", icon: LayoutDashboard },
      { name: "Analytics", path: "/app/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Money",
    items: [
      { name: "Transactions", path: "/app/transactions", icon: Receipt },
      { name: "Budget", path: "/app/budget", icon: Wallet },
      { name: "Goals", path: "/app/goals", icon: Target },
      { name: "Calculator", path: "/app/calculator", icon: CalcIcon },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { name: "Voice Entry", path: "/app/voice", icon: Mic },
      { name: "Receipt Scanner", path: "/app/scanner", icon: ScanLine },
      { name: "AI Insights", path: "/app/insights", icon: Brain },
      { name: "AI Predictions", path: "/app/predictions", icon: TrendingUp },
      { name: "AI Chatbot", path: "/app/chatbot", icon: Bot },
    ],
  },
  {
    label: "Security",
    items: [
      { name: "Alerts", path: "/app/alerts", icon: AlertTriangle },
      { name: "Bank Import", path: "/app/import", icon: Upload },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Profile", path: "/app/profile", icon: User },
    ],
  },
];

export default function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update last sync time
    setLastSync(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      if (isOnline) {
        setLastSync(new Date().toLocaleTimeString());
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const isActive = (path: string) =>
    location.pathname === path || (path === "/app" && location.pathname === "/app");

  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      {/* Mobile Header */}
      <div
        className="lg:hidden sticky top-0 z-40 border-b px-4 h-16 flex items-center justify-between"
        style={{
          background: "rgba(8, 12, 20, 0.9)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}
          >
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold" style={{ color: "#e8edf5" }}>
            Finance<span style={{ color: "#10b981" }}>AI</span>
          </span>
        </div>
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: "#6b7ca0" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 pt-16 overflow-y-auto"
          style={{ background: "#080c14" }}
        >
          <nav className="px-4 py-4 space-y-1">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <div
                  className="text-xs font-semibold uppercase tracking-widest px-3 mb-2"
                  style={{ color: "#3d4f6b", letterSpacing: "0.1em" }}
                >
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-0.5"
                      style={{
                        background: active ? "rgba(16,185,129,0.1)" : "transparent",
                        color: active ? "#10b981" : "#6b7ca0",
                        border: active ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div
          className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 border-r"
          style={{ background: "#0a0f1e", borderColor: "rgba(255,255,255,0.05)" }}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 px-5 h-16 border-b flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}
            >
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: "#e8edf5", letterSpacing: "-0.02em" }}>
              Finance<span style={{ color: "#10b981" }}>AI</span>
            </span>
          </div>

          {/* AI Quick Action */}
          <div className="px-4 pt-4">
            <Link
              to="/app/chatbot"
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#10b981",
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <div
                  className="text-xs font-semibold uppercase tracking-widest px-3 mb-2"
                  style={{ color: "#3d4f6b", letterSpacing: "0.1em" }}
                >
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                        style={{
                          background: active ? "rgba(16,185,129,0.1)" : "transparent",
                          color: active ? "#10b981" : "#6b7ca0",
                          border: active ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                            (e.currentTarget as HTMLElement).style.color = "#e8edf5";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#6b7ca0";
                          }
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{item.name}</span>
                        {item.name === "Alerts" && (
                          <span
                            className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                          >
                            2
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile */}
          <div
            className="px-4 pb-4 border-t pt-4"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "#fff" }}
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: "#e8edf5" }}>
                  {user?.name || "User"}
                </div>
                <div className="text-xs truncate" style={{ color: "#6b7ca0" }}>
                  {user?.email || "user@email.com"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex-1 min-h-screen">
          {/* Top Bar */}
          <div
            className="hidden lg:flex sticky top-0 z-30 h-16 border-b items-center justify-between px-8"
            style={{
              background: "rgba(8,12,20,0.9)",
              backdropFilter: "blur(20px)",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl w-64"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Search className="w-4 h-4" style={{ color: "#6b7ca0" }} />
              <span className="text-sm" style={{ color: "#3d4f6b" }}>Search anything...</span>
            </div>
            <div className="flex items-center gap-3">
              {!isOnline && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                  <WifiOff className="w-3 h-3" />
                  Offline
                </div>
              )}
              {isOnline && lastSync && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#6b7ca0" }}>
                  <Clock className="w-3 h-3" />
                  {lastSync}
                </div>
              )}
              <LanguageSwitcher />
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Bell className="w-4 h-4" style={{ color: "#6b7ca0" }} />
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 text-xs flex items-center justify-center"
                  style={{
                    background: "#ef4444",
                    borderColor: "#080c14",
                    fontSize: "8px",
                    color: "#fff",
                  }}
                >
                  2
                </span>
              </button>
              <Link
                to="/app/chatbot"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "#10b981",
                }}
              >
                <Bot className="w-4 h-4" />
                AI Assistant
              </Link>
            </div>
          </div>

          <RoleProvider>
            <main className="p-4 lg:p-8">
              <Outlet />
            </main>
          </RoleProvider>
        </div>
      </div>
    </div>
  );
}
