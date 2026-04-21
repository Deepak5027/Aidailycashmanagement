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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", path: "/app", icon: LayoutDashboard },
  { name: "Transactions", path: "/app/transactions", icon: Receipt },
  { name: "Budget", path: "/app/budget", icon: Wallet },
  { name: "Goals", path: "/app/goals", icon: Target },
  { name: "Alerts", path: "/app/alerts", icon: AlertTriangle },
  { name: "Scanner", path: "/app/scanner", icon: ScanLine },
  { name: "Analytics", path: "/app/analytics", icon: BarChart3 },
  { name: "Voice Entry", path: "/app/voice", icon: Mic },
  { name: "AI Insights", path: "/app/insights", icon: Brain },
  { name: "Profile", path: "/app/profile", icon: User },
];

export default function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">FinanceAI</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-white pt-16">
          <nav className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/app" && location.pathname === "/app");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r">
          <div className="flex items-center gap-2 px-6 h-16 border-b">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceAI
            </span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/app" && location.pathname === "/app");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex-1">
          <main className="p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}