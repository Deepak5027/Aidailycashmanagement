import { weeklyData, categorySpending } from "../data/mockData";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Plus,
  Sparkles,
  Bot,
  Briefcase,
  GraduationCap,
  Home,
  Users,
  Target,
  Trophy,
  Shield,
  Zap,
  Bell,
  Mic,
  Scan,
  Receipt,
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  Star,
  RefreshCw,
  LogOut,
  Wallet,
  Package,
  FileText,
  Lightbulb,
  Coffee,
  Smartphone,
  Plane,
  BookOpen,
  ShoppingBag,
  Activity,
} from "lucide-react";
import { Link } from "react-router";
import { transactionsAPI, budgetsAPI, aiAPI } from "../../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../contexts/RoleContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { LanguageSelector } from "../components/LanguageSelector";

// ─── Shared helpers ──────────────────────────────────────────────────────────

const glassCard = (accent = "rgba(255,255,255,0.07)") => ({
  background: "rgba(14,20,35,0.75)",
  border: `1px solid ${accent}`,
  backdropFilter: "blur(16px)",
});

function Ring({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.1} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-black text-sm" style={{ color, fontFamily: "monospace" }}>{value}</span>
      </div>
    </div>
  );
}

function BarMini({ values, color, labels }: { values: number[]; color: string; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-20 w-full">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-t-sm" style={{
            height: `${(v / max) * 64}px`,
            background: `linear-gradient(to top, ${color}, ${color}88)`,
            minHeight: 4,
          }} />
          <span style={{ fontSize: 9, color: "#6b7ca0" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function LineMini({ values, color }: { values: number[]; color: string }) {
  const W = 200, H = 60, pad = 8;
  const max = Math.max(...values, 1);
  const iW = W - pad * 2;
  const step = iW / (values.length - 1);
  const pts = values.map((v, i) => `${pad + i * step},${H - pad - ((v / max) * (H - pad * 2))}`).join(" ");
  const area = `${pad},${H - pad} ${pts} ${pad + (values.length - 1) * step},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <polygon points={area} fill={color} fillOpacity={0.12} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AICard({ color, advice }: { color: string; advice: string[] }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Sparkles className="w-4 h-4" style={{ color }} />
        </div>
        <span className="font-semibold text-sm" style={{ color }}>AI Financial Advisor</span>
        <Link to="/app/chatbot" className="ml-auto text-xs px-2 py-1 rounded-lg flex items-center gap-1"
          style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>
          <Bot className="w-3 h-3" /> Chat
        </Link>
      </div>
      <div className="space-y-2">
        {advice.map((a, i) => (
          <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "#94a3b8" }}>
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
            {a}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActions({ color }: { color: string }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {[
        { icon: Plus, label: "Add", to: "/app/transactions" },
        { icon: Mic, label: "Voice", to: "/app/voice" },
        { icon: Scan, label: "Scan", to: "/app/scanner" },
        { icon: Bot, label: "AI Chat", to: "/app/chatbot" },
      ].map((a) => (
        <Link key={a.label} to={a.to}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={{ background: `${color}10`, border: `1px solid ${color}20`, color }}>
          <a.icon className="w-3.5 h-3.5" />
          {a.label}
        </Link>
      ))}
    </div>
  );
}

function HealthScoreBadge({ score, color }: { score: number; color: string }) {
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4" style={glassCard()}>
      <Ring value={score} color={color} size={72} />
      <div>
        <div className="text-xs mb-0.5" style={{ color: "#6b7ca0" }}>Health Score</div>
        <div className="text-xl font-black" style={{ color: "#e8edf5" }}>{score}<span className="text-sm font-normal">/100</span></div>
        <div className="text-xs font-medium" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, up, icon: Icon, color }: {
  label: string; value: string; change: string; up: boolean; icon: any; color: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={glassCard()}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs" style={{ color: "#6b7ca0" }}>{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-black mb-1" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{value}</div>
      <div className="text-xs font-medium flex items-center gap-1" style={{ color: up ? "#10b981" : "#f59e0b" }}>
        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
  );
}

// ─── Role Selector ────────────────────────────────────────────────────────────

const ROLES = [
  {
    id: "business",
    label: "Business Owner",
    icon: Briefcase,
    color: "#10b981",
    glow: "rgba(16,185,129,0.25)",
    description: "Track revenue, manage suppliers, analyze profit & loss, and get AI business insights.",
    tags: ["Cash Flow", "Tax/GST", "Payroll"],
  },
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.25)",
    description: "Manage pocket money, track subscriptions, food spending, and build saving habits.",
    tags: ["Pocket Money", "Subscriptions", "Goals"],
  },
  {
    id: "home",
    label: "Home Manager",
    icon: Home,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
    description: "Plan grocery budgets, manage household bills, track utilities, and save for family goals.",
    tags: ["Groceries", "Utilities", "Family Goals"],
  },
  {
    id: "freelancer",
    label: "Freelancer",
    icon: Users,
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.25)",
    description: "Track client payments, manage invoices, estimate taxes, and predict income flow.",
    tags: ["Invoices", "Tax Estimate", "Income Forecast"],
  },
];

function RoleSelector({ onSelect }: { onSelect: (role: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-auto py-8 px-4"
      style={{ background: "linear-gradient(135deg, #080c14 0%, #0d1220 50%, #080c14 100%)" }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full blur-3xl opacity-20"
          style={{ width: 500, height: 500, top: -150, left: -150,
            background: "radial-gradient(circle, #10b981, transparent 70%)" }} />
        <div className="absolute rounded-full blur-3xl opacity-15"
          style={{ width: 400, height: 400, bottom: 0, right: -100,
            background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}>
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold" style={{ color: "#e8edf5" }}>
          Finance<span style={{ color: "#10b981" }}>AI</span>
        </span>
      </div>

      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
          <Sparkles className="w-4 h-4" /> Personalized AI Experience
        </div>
        <h1 className="font-black mb-3"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", color: "#e8edf5", letterSpacing: "-0.03em" }}>
          Choose Your Financial Lifestyle
        </h1>
        <p style={{ color: "#6b7ca0", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
          Personalize your AI financial assistant experience. Your dashboard will be fully customized for your life.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl relative z-10">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isHovered = hovered === role.id;
          const isSelected = selected === role.id;
          return (
            <button
              key={role.id}
              onClick={() => handleSelect(role.id)}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              className="text-left rounded-3xl p-6 transition-all duration-300 flex flex-col gap-4"
              style={{
                background: isSelected
                  ? `${role.color}15`
                  : isHovered
                  ? `${role.color}10`
                  : "rgba(14,20,35,0.7)",
                border: `1px solid ${isHovered || isSelected ? role.color + "50" : "rgba(255,255,255,0.07)"}`,
                backdropFilter: "blur(16px)",
                boxShadow: isHovered || isSelected ? `0 0 40px ${role.glow}, 0 8px 32px rgba(0,0,0,0.4)` : "0 4px 24px rgba(0,0,0,0.3)",
                transform: isHovered ? "translateY(-4px) scale(1.01)" : isSelected ? "scale(0.98)" : "none",
                cursor: "pointer",
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: isHovered || isSelected ? `${role.color}20` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isHovered || isSelected ? role.color + "40" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isHovered ? `0 0 20px ${role.glow}` : "none",
                  transition: "all 0.3s",
                }}>
                <Icon className="w-7 h-7" style={{ color: isHovered || isSelected ? role.color : "#6b7ca0" }} />
              </div>

              <div>
                <h3 className="font-bold text-base mb-1.5" style={{ color: "#e8edf5" }}>{role.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7ca0" }}>{role.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {role.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${role.color}12`, color: role.color, border: `1px solid ${role.color}25` }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 font-semibold text-sm mt-1"
                style={{ color: isHovered || isSelected ? role.color : "#3d4f6b" }}>
                {isSelected ? (
                  <><CheckCircle2 className="w-4 h-4" /> Setting up...</>
                ) : (
                  <><ArrowUpRight className="w-4 h-4" /> Select this mode</>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-xs relative z-10" style={{ color: "#3d4f6b" }}>
        You can change your mode anytime from the profile settings
      </p>
    </div>
  );
}

// ─── Business Dashboard ───────────────────────────────────────────────────────

function BusinessDashboard({ user, onReset }: { user: any; onReset: () => void }) {
  const C = "#10b981";
  const revenueData = [142, 168, 155, 190, 178, 212, 198, 225, 210, 240, 228, 265];
  const cashFlow = [40, 65, 30, 80, 55, 90, 70, 85, 60, 95, 75, 110];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const suppliers = [
    { name: "RawMat Supplies Co.", due: "May 30", amount: "₹84,000", status: "due" },
    { name: "TechParts Ltd.", due: "Jun 3", amount: "₹32,500", status: "upcoming" },
    { name: "PackagePro", due: "Jun 8", amount: "₹18,200", status: "upcoming" },
    { name: "LogiFreight India", due: "May 28", amount: "₹27,800", status: "overdue" },
  ];
  const staff = [
    { role: "Operations Lead", salary: "₹95,000", status: "paid" },
    { role: "Sales Manager", salary: "₹72,000", status: "paid" },
    { role: "Developer (Contract)", salary: "₹60,000", status: "pending" },
    { role: "Account Executive", salary: "₹45,000", status: "paid" },
  ];

  return (
    <div className="space-y-5 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${C}18` }}>
              <Briefcase className="w-3.5 h-3.5" style={{ color: C }} />
            </div>
            <span className="text-xs font-medium" style={{ color: C }}>Business Owner Mode</span>
            <button onClick={onReset} className="ml-2 text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
              style={{ color: "#6b7ca0", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RefreshCw className="w-3 h-3" /> Switch
            </button>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "#e8edf5", letterSpacing: "-0.02em" }}>
            Business Command Center
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7ca0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <QuickActions color={C} />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value="₹2,84,500" change="+14.2% vs yesterday" up icon={TrendingUp} color={C} />
        <StatCard label="Monthly Profit" value="₹8,42,000" change="+6.8% vs last month" up icon={DollarSign} color="#3b82f6" />
        <StatCard label="Operational Cost" value="₹3,18,200" change="+12% this month" up={false} icon={ShoppingCart} color="#f59e0b" />
        <StatCard label="Tax/GST Due" value="₹1,24,600" change="Due in 12 days" up={false} icon={FileText} color="#ef4444" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Health + AI */}
        <div className="space-y-4">
          <HealthScoreBadge score={82} color={C} />
          <AICard color={C} advice={[
            "Operational costs increased by 12% this month — consider renegotiating supplier contracts.",
            "You can optimize supplier expenses by consolidating orders from RawMat and PackagePro.",
            "Cash flow looks strong for Q2. Consider reinvesting in inventory expansion.",
          ]} />
        </div>

        {/* Revenue chart */}
        <div className="lg:col-span-2 rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "#e8edf5" }}>Monthly Revenue (₹ Lakhs)</h3>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: `${C}12`, color: C }}>+18.4% YoY</span>
          </div>
          <BarMini values={revenueData} color={C} labels={months} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Supplier tracker */}
        <div className="rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#e8edf5" }}>
              <Package className="w-4 h-4" style={{ color: C }} /> Supplier Payments
            </h3>
          </div>
          <div className="space-y-3">
            {suppliers.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#e8edf5" }}>{s.name}</div>
                  <div className="text-xs" style={{ color: "#6b7ca0" }}>Due: {s.due}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{s.amount}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: s.status === "overdue" ? "rgba(239,68,68,0.12)" : s.status === "due" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                      color: s.status === "overdue" ? "#ef4444" : s.status === "due" ? "#f59e0b" : "#10b981",
                    }}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff salaries */}
        <div className="rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#e8edf5" }}>
              <Users className="w-4 h-4" style={{ color: "#3b82f6" }} /> Staff Salaries
            </h3>
            <span className="text-xs" style={{ color: "#6b7ca0" }}>June 2026</span>
          </div>
          <div className="space-y-3">
            {staff.map((s) => (
              <div key={s.role} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: s.status === "paid" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)" }}>
                    {s.status === "paid"
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: "#10b981" }} />
                      : <Clock className="w-4 h-4" style={{ color: "#f59e0b" }} />}
                  </div>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>{s.role}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{s.salary}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash flow + Tax */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl p-6" style={glassCard()}>
          <h3 className="font-bold mb-4" style={{ color: "#e8edf5" }}>Cash Flow Trend</h3>
          <LineMini values={cashFlow} color={C} />
          <div className="flex justify-between mt-2">
            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m, i) => (
              <span key={i} style={{ fontSize: 9, color: "#6b7ca0" }}>{m}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: "#ef4444" }} />
            <h3 className="font-bold" style={{ color: "#fca5a5" }}>Tax / GST</h3>
          </div>
          {[
            { label: "GST Collected", value: "₹84,320" },
            { label: "GST Input Credit", value: "₹31,200" },
            { label: "Net GST Payable", value: "₹53,120" },
            { label: "Advance Tax Due", value: "₹71,480" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-xs" style={{ color: "#6b7ca0" }}>{row.label}</span>
              <span className="text-sm font-bold" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{row.value}</span>
            </div>
          ))}
          <div className="pt-2 border-t" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
            <div className="text-xs" style={{ color: "#f87171" }}>⚠ Next filing: June 20, 2026</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4" style={{ color: "#f59e0b" }} />
          <span className="font-semibold text-sm" style={{ color: "#fbbf24" }}>Smart Business Alerts</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            "Supplier LogiFreight payment is overdue by 2 days. Late fee risk detected.",
            "Operational costs up 12% — AI recommends reviewing vendor contracts.",
            "Revenue target 94% achieved. ₹16,000 needed to hit monthly goal.",
          ].map((alert, i) => (
            <div key={i} className="text-sm p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", color: "#d6a64e" }}>
              {alert}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ user, onReset }: { user: any; onReset: () => void }) {
  const C = "#06b6d4";
  const weekSpend = [280, 420, 310, 180, 520, 390, 260];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const subscriptions = [
    { name: "Netflix", cost: "₹649/mo", active: true },
    { name: "Spotify", cost: "₹119/mo", active: true },
    { name: "Amazon Prime", cost: "₹299/mo", active: true },
    { name: "Coursera Plus", cost: "₹4,999/yr", active: false },
  ];
  const goals = [
    { name: "Laptop Fund", current: 12000, target: 45000, color: C },
    { name: "Goa Trip", current: 5500, target: 15000, color: "#7c3aed" },
    { name: "Emergency ₹", current: 3200, target: 10000, color: "#10b981" },
  ];

  return (
    <div className="space-y-5 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${C}18` }}>
              <GraduationCap className="w-3.5 h-3.5" style={{ color: C }} />
            </div>
            <span className="text-xs font-medium" style={{ color: C }}>Student Mode</span>
            <button onClick={onReset} className="ml-2 text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
              style={{ color: "#6b7ca0", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RefreshCw className="w-3 h-3" /> Switch
            </button>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "#e8edf5", letterSpacing: "-0.02em" }}>
            Hey {user?.name?.split(" ")[0] || "Arjun"} 👋 Smart Spend Today?
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7ca0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <QuickActions color={C} />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pocket Money Left" value="₹3,240" change="12 days remaining" up icon={Wallet} color={C} />
        <StatCard label="Food Delivery" value="₹1,840" change="+38% vs last week" up={false} icon={ShoppingBag} color="#ef4444" />
        <StatCard label="Subscriptions" value="₹1,067" change="4 active plans" up={false} icon={Smartphone} color="#7c3aed" />
        <StatCard label="Saved This Month" value="₹2,400" change="+₹400 vs target" up icon={Target} color="#10b981" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="space-y-4">
          <HealthScoreBadge score={67} color={C} />
          <AICard color={C} advice={[
            "You spent too much on food delivery this week — ₹1,840 vs ₹800 budget.",
            "Cancel Coursera Plus (inactive). Save ₹417/month redirected to Laptop Fund.",
            "Reduce weekend dining by 50% to hit your Goa Trip goal 3 weeks early.",
          ]} />
        </div>

        <div className="lg:col-span-2 rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "#e8edf5" }}>Weekly Spending (₹)</h3>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: `${C}12`, color: C }}>This Week</span>
          </div>
          <BarMini values={weekSpend} color={C} labels={days} />
          <div className="flex items-center gap-6 mt-4 text-xs" style={{ color: "#6b7ca0" }}>
            <span>Daily budget: <strong style={{ color: C }}>₹450</strong></span>
            <span>Avg spent: <strong style={{ color: "#ef4444" }}>₹480</strong></span>
            <span>Streak: <strong style={{ color: "#f59e0b" }}>🔥 7 days</strong></span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Subscriptions */}
        <div className="rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#e8edf5" }}>
              <Smartphone className="w-4 h-4" style={{ color: C }} /> Subscription Monitor
            </h3>
            <span className="text-xs font-bold" style={{ color: "#ef4444" }}>₹1,067/mo total</span>
          </div>
          <div className="space-y-3">
            {subscriptions.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: s.active ? `${C}15` : "rgba(255,255,255,0.05)" }}>
                    <Smartphone className="w-4 h-4" style={{ color: s.active ? C : "#3d4f6b" }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: s.active ? "#e8edf5" : "#3d4f6b" }}>{s.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold" style={{ color: s.active ? "#e8edf5" : "#3d4f6b", fontFamily: "monospace" }}>{s.cost}</div>
                  <div className="text-xs" style={{ color: s.active ? C : "#ef4444" }}>{s.active ? "Active" : "Unused"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#e8edf5" }}>
              <Target className="w-4 h-4" style={{ color: "#10b981" }} /> Savings Goals
            </h3>
            <Link to="/app/goals" className="text-xs" style={{ color: C }}>Manage →</Link>
          </div>
          <div className="space-y-4">
            {goals.map((g) => {
              const pct = Math.round((g.current / g.target) * 100);
              return (
                <div key={g.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>{g.name}</span>
                    <span className="text-xs font-bold" style={{ color: g.color, fontFamily: "monospace" }}>
                      ₹{g.current.toLocaleString()} / ₹{g.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#6b7ca0" }}>{pct}% complete</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spending categories breakdown */}
      <div className="rounded-2xl p-6" style={glassCard()}>
        <h3 className="font-bold mb-4" style={{ color: "#e8edf5" }}>Monthly Expense Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Food & Delivery", value: "₹3,840", pct: 38, color: "#ef4444", icon: Coffee },
            { label: "Study Expenses", value: "₹1,200", pct: 12, color: C, icon: BookOpen },
            { label: "Transport", value: "₹980", pct: 10, color: "#10b981", icon: Plane },
            { label: "Entertainment", value: "₹1,540", pct: 15, color: "#7c3aed", icon: Smartphone },
          ].map((cat) => (
            <div key={cat.label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <cat.icon className="w-5 h-5 mb-2" style={{ color: cat.color }} />
              <div className="text-sm font-bold mb-0.5" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{cat.value}</div>
              <div className="text-xs mb-2" style={{ color: "#6b7ca0" }}>{cat.label}</div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: cat.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamification */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { emoji: "🔥", label: "7-Day Streak", sub: "Daily tracking", color: "#f59e0b" },
          { emoji: "💰", label: "₹2,400 Saved", sub: "This month", color: "#10b981" },
          { emoji: "🎯", label: "Goal on Track", sub: "Laptop Fund", color: C },
        ].map((b) => (
          <div key={b.label} className="rounded-2xl p-4 text-center" style={glassCard()}>
            <div className="text-2xl mb-1">{b.emoji}</div>
            <div className="text-xs font-bold mb-0.5" style={{ color: "#e8edf5" }}>{b.label}</div>
            <div className="text-xs" style={{ color: "#6b7ca0" }}>{b.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Home Manager Dashboard ───────────────────────────────────────────────────

function HomeDashboard({ user, onReset }: { user: any; onReset: () => void }) {
  const C = "#f59e0b";
  const groceryData = [8200, 9100, 7800, 9600, 10200, 9400, 8800, 11000, 9200, 10500, 9800, 11400];
  const bills = [
    { name: "Electricity Board", due: "Jun 5", amount: "₹2,840", icon: Zap, urgent: true },
    { name: "Water Supply", due: "Jun 10", amount: "₹480", icon: Shield, urgent: false },
    { name: "Gas Connection", due: "Jun 12", amount: "₹920", icon: Bell, urgent: false },
    { name: "Internet (ACT)", due: "Jun 8", amount: "₹1,100", icon: Smartphone, urgent: true },
  ];
  const familyGoals = [
    { name: "Summer Vacation", current: 28000, target: 80000, color: C },
    { name: "Home Renovation", current: 45000, target: 200000, color: "#10b981" },
    { name: "Children Education", current: 62000, target: 150000, color: "#3b82f6" },
  ];

  return (
    <div className="space-y-5 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${C}18` }}>
              <Home className="w-3.5 h-3.5" style={{ color: C }} />
            </div>
            <span className="text-xs font-medium" style={{ color: C }}>Home Manager Mode</span>
            <button onClick={onReset} className="ml-2 text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
              style={{ color: "#6b7ca0", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RefreshCw className="w-3 h-3" /> Switch
            </button>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "#e8edf5", letterSpacing: "-0.02em" }}>
            Family Finance Hub 🏡
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7ca0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <QuickActions color={C} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Budget" value="₹42,000" change="₹18,400 remaining" up icon={Wallet} color={C} />
        <StatCard label="Grocery Spend" value="₹11,400" change="+8% vs last month" up={false} icon={ShoppingCart} color="#ef4444" />
        <StatCard label="Bills Due" value="₹5,340" change="4 bills this week" up={false} icon={Bell} color="#3b82f6" />
        <StatCard label="Family Savings" value="₹8,600" change="+₹1,200 this month" up icon={Target} color="#10b981" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="space-y-4">
          <HealthScoreBadge score={74} color={C} />
          <AICard color={C} advice={[
            "Grocery spending increased by 8% — consider bulk buying from wholesale markets.",
            "You are maintaining a healthy savings ratio of 20%. Keep it up!",
            "Electricity bill is 15% higher than usual. Check for peak-hour usage patterns.",
          ]} />
        </div>

        <div className="lg:col-span-2 rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "#e8edf5" }}>Grocery Spending (₹)</h3>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: `${C}12`, color: C }}>12 Months</span>
          </div>
          <BarMini values={groceryData} color={C} labels={["J","F","M","A","M","J","J","A","S","O","N","D"]} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Bill reminders */}
        <div className="rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#e8edf5" }}>
              <Bell className="w-4 h-4" style={{ color: C }} /> Bill Due Reminders
            </h3>
          </div>
          <div className="space-y-3">
            {bills.map((b) => (
              <div key={b.name} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: b.urgent ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.03)", border: b.urgent ? "1px solid rgba(239,68,68,0.15)" : "none" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: b.urgent ? "rgba(239,68,68,0.12)" : `${C}12` }}>
                    <b.icon className="w-4 h-4" style={{ color: b.urgent ? "#ef4444" : C }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#e8edf5" }}>{b.name}</div>
                    <div className="text-xs" style={{ color: b.urgent ? "#f87171" : "#6b7ca0" }}>Due: {b.due}</div>
                  </div>
                </div>
                <div className="text-sm font-bold" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{b.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Family goals */}
        <div className="rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#e8edf5" }}>
              <Target className="w-4 h-4" style={{ color: "#10b981" }} /> Family Goals
            </h3>
          </div>
          <div className="space-y-4">
            {familyGoals.map((g) => {
              const pct = Math.round((g.current / g.target) * 100);
              return (
                <div key={g.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>{g.name}</span>
                    <span className="text-xs font-bold" style={{ color: g.color, fontFamily: "monospace" }}>{pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: "#6b7ca0" }}>
                    <span>₹{g.current.toLocaleString()}</span>
                    <span>₹{g.target.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Essential vs Unnecessary */}
      <div className="rounded-2xl p-6" style={glassCard()}>
        <h3 className="font-bold mb-4" style={{ color: "#e8edf5" }}>Essential vs Discretionary Spending</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Groceries", value: "₹11,400", type: "essential", pct: 72 },
            { label: "Utilities", value: "₹5,340", type: "essential", pct: 34 },
            { label: "Dining Out", value: "₹3,200", type: "discretionary", pct: 20 },
            { label: "Shopping", value: "₹4,800", type: "discretionary", pct: 30 },
          ].map((cat) => (
            <div key={cat.label} className="rounded-2xl p-4 text-center"
              style={{ background: cat.type === "essential" ? `${C}08` : "rgba(239,68,68,0.05)", border: `1px solid ${cat.type === "essential" ? C + "20" : "rgba(239,68,68,0.15)"}` }}>
              <div className="text-xs mb-1" style={{ color: cat.type === "essential" ? C : "#f87171" }}>
                {cat.type === "essential" ? "✓ Essential" : "⚠ Discretionary"}
              </div>
              <div className="text-base font-bold" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{cat.value}</div>
              <div className="text-xs mt-1 mb-2" style={{ color: "#6b7ca0" }}>{cat.label}</div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: cat.type === "essential" ? C : "#ef4444" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Freelancer Dashboard ─────────────────────────────────────────────────────

function FreelancerDashboard({ user, onReset }: { user: any; onReset: () => void }) {
  const C = "#7c3aed";
  const earningsData = [42000, 38000, 55000, 48000, 62000, 45000, 71000, 58000, 65000, 52000, 78000, 68000];
  const clients = [
    { name: "TechNova Solutions", pending: "₹45,000", status: "due", days: "2 days" },
    { name: "DesignCraft Agency", pending: "₹28,500", status: "overdue", days: "5 days ago" },
    { name: "StartupHub India", pending: "₹18,000", status: "paid", days: "Received" },
    { name: "MediaPulse Ltd.", pending: "₹32,000", status: "invoiced", days: "10 days" },
  ];
  const projects = [
    { name: "Brand Identity – TechNova", revenue: "₹1,20,000", status: "active" },
    { name: "Web App – DesignCraft", revenue: "₹85,000", status: "active" },
    { name: "Campaign – MediaPulse", revenue: "₹64,000", status: "completed" },
    { name: "UI Audit – StartupHub", revenue: "₹38,000", status: "completed" },
  ];

  return (
    <div className="space-y-5 max-w-7xl" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${C}18` }}>
              <Users className="w-3.5 h-3.5" style={{ color: C }} />
            </div>
            <span className="text-xs font-medium" style={{ color: C }}>Freelancer Mode</span>
            <button onClick={onReset} className="ml-2 text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
              style={{ color: "#6b7ca0", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RefreshCw className="w-3 h-3" /> Switch
            </button>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "#e8edf5", letterSpacing: "-0.02em" }}>
            Creative Finance Studio 🎨
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7ca0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <QuickActions color={C} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This Month Earned" value="₹68,000" change="+12% vs last month" up icon={TrendingUp} color={C} />
        <StatCard label="Pending Invoices" value="₹1,23,500" change="3 clients overdue" up={false} icon={Receipt} color="#ef4444" />
        <StatCard label="Income Consistency" value="84%" change="+6pts this quarter" up icon={Activity} color="#10b981" />
        <StatCard label="Tax Estimate" value="₹18,400" change="Q2 advance tax due" up={false} icon={FileText} color="#f59e0b" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="space-y-4">
          <HealthScoreBadge score={79} color={C} />
          <AICard color={C} advice={[
            "You may face cash flow gaps next month — DesignCraft payment overdue by 5 days.",
            "Your top client TechNova generated 45% of your income. Diversify to reduce risk.",
            "Raise your hourly rate by ₹500 — market analysis shows you are 18% below peers.",
          ]} />
        </div>

        <div className="lg:col-span-2 rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "#e8edf5" }}>Monthly Earnings (₹)</h3>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: `${C}12`, color: C }}>₹6.86L YTD</span>
          </div>
          <BarMini values={earningsData} color={C} labels={["J","F","M","A","M","J","J","A","S","O","N","D"]} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Client payment tracker */}
        <div className="rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#e8edf5" }}>
              <CreditCard className="w-4 h-4" style={{ color: C }} /> Client Payments
            </h3>
          </div>
          <div className="space-y-3">
            {clients.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: c.status === "paid" ? "rgba(16,185,129,0.12)" : c.status === "overdue" ? "rgba(239,68,68,0.12)" : `${C}12` }}>
                    {c.status === "paid"
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: "#10b981" }} />
                      : c.status === "overdue"
                      ? <AlertTriangle className="w-4 h-4" style={{ color: "#ef4444" }} />
                      : <Clock className="w-4 h-4" style={{ color: C }} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#e8edf5" }}>{c.name}</div>
                    <div className="text-xs" style={{ color: "#6b7ca0" }}>{c.days}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{c.pending}</div>
                  <span className="text-xs capitalize" style={{ color: c.status === "paid" ? "#10b981" : c.status === "overdue" ? "#ef4444" : C }}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="rounded-2xl p-6" style={glassCard()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#e8edf5" }}>
              <BarChart3 className="w-4 h-4" style={{ color: "#3b82f6" }} /> Project Revenue
            </h3>
          </div>
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.name} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate" style={{ color: "#e8edf5" }}>{p.name}</span>
                  <span className="text-sm font-bold ml-2 flex-shrink-0" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{p.revenue}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: p.status === "active" ? `${C}12` : "rgba(16,185,129,0.12)", color: p.status === "active" ? C : "#10b981" }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income prediction */}
      <div className="rounded-2xl p-6" style={glassCard()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: "#e8edf5" }}>Income Prediction — Next 6 Months</h3>
          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: `${C}12`, color: C }}>AI Forecast</span>
        </div>
        <LineMini values={[68000, 72000, 65000, 80000, 75000, 88000]} color={C} />
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { label: "Avg Monthly", value: "₹74,667" },
            { label: "Best Month", value: "₹88,000 (Nov)" },
            { label: "Risk Gap", value: "Jun (Low)" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-xs mb-1" style={{ color: "#6b7ca0" }}>{s.label}</div>
              <div className="text-sm font-bold" style={{ color: "#e8edf5", fontFamily: "monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const { role, setRole, clearRole } = useRole();
  const { changeLanguage, languagePreferenceSet } = useLanguage();

  const handleSelect = (r: string) => {
    setRole(r as any);
  };

  const handleReset = () => {
    clearRole();
  };

  const handleLanguageSelect = async (lang: string) => {
    await changeLanguage(lang);
  };

  // Step 1: Select Role
  if (!role) {
    return <RoleSelector onSelect={handleSelect} />;
  }

  // Step 2: Select Language (only if not set yet)
  if (!languagePreferenceSet) {
    return <LanguageSelector onSelect={handleLanguageSelect} />;
  }

  // Step 3: Show Dashboard
  const props = { user, onReset: handleReset };

  switch (role) {
    case "business":   return <BusinessDashboard {...props} />;
    case "student":    return <StudentDashboard {...props} />;
    case "home":       return <HomeDashboard {...props} />;
    case "freelancer": return <FreelancerDashboard {...props} />;
    default:           return <RoleSelector onSelect={handleSelect} />;
  }
}
