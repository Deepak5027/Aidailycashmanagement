import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { categories as defaultCategories } from "../data/mockData";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Trash2,
  Edit,
  Briefcase,
  GraduationCap,
  Home,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { transactionsAPI, aiAPI } from "../../services/api";
import { useRole } from "../contexts/RoleContext";

const ROLE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  business: { label: "Business Owner", icon: Briefcase, color: "#10b981" },
  student:  { label: "Student",        icon: GraduationCap, color: "#06b6d4" },
  home:     { label: "Home Manager",   icon: Home,  color: "#f59e0b" },
  freelancer: { label: "Freelancer",   icon: Users, color: "#7c3aed" },
};

const glassCard = {
  background: "rgba(14,20,35,0.75)",
  border: "1px solid rgba(255,255,255,0.07)",
  backdropFilter: "blur(16px)",
};

export default function Transactions() {
  const { role, roleCategories } = useRole();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    merchant: "",
    amount: "",
    category: "",
    type: "expense",
    paymentMode: "",
  });

  // Use role-specific categories if a role is selected, otherwise fall back to defaults
  const activeCategories = roleCategories.length > 0 ? roleCategories : defaultCategories;

  const roleMeta = role ? ROLE_LABELS[role] : null;

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionsAPI.getAll();
      setTransactions(response.transactions || []);
    } catch (error: any) {
      console.error("Failed to load transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleAddTransaction = async () => {
    if (
      !newTransaction.merchant ||
      !newTransaction.amount ||
      !newTransaction.category ||
      !newTransaction.paymentMode
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const transactionData = {
        merchant: newTransaction.merchant,
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        type: newTransaction.type,
        payment_mode: newTransaction.paymentMode,
        date: new Date().toISOString(),
      };

      const fraudAnalysis = await aiAPI.analyzeFraud(transactionData);

      const response = await transactionsAPI.create({
        ...transactionData,
        risk_score: fraudAnalysis.risk_score,
        status: fraudAnalysis.status,
      });

      setTransactions([response.transaction, ...transactions]);
      setIsAddDialogOpen(false);
      setNewTransaction({ merchant: "", amount: "", category: "", type: "expense", paymentMode: "" });

      if (fraudAnalysis.status === "suspicious") {
        toast.warning("Transaction added but flagged as suspicious!");
      } else {
        toast.success("Transaction added successfully!");
      }
    } catch (error: any) {
      console.error("Failed to add transaction:", error);
      toast.error(error.message || "Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionsAPI.delete(id);
      setTransactions(transactions.filter((t) => t.id !== id));
      toast.success("Transaction deleted");
    } catch (error: any) {
      console.error("Failed to delete transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${roleMeta?.color || "#10b981"}40`, borderTopColor: roleMeta?.color || "#10b981" }} />
          <p style={{ color: "#6b7ca0" }}>Loading transactions...</p>
        </div>
      </div>
    );
  }

  const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome   = filteredTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const accentColor = roleMeta?.color || "#10b981";

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {roleMeta && (
            <div className="flex items-center gap-1.5 mb-1">
              <roleMeta.icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span className="text-xs font-medium" style={{ color: accentColor }}>{roleMeta.label} · Transactions</span>
            </div>
          )}
          <h1 className="text-2xl font-bold" style={{ color: "#e8edf5" }}>Transactions</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7ca0" }}>Track and manage all your {role ? `${roleMeta?.label.toLowerCase()} ` : ""}transactions</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
              style={{ background: accentColor, color: "#fff", border: "none" }}>
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" style={{ background: "#0e1423", border: "1px solid rgba(255,255,255,0.1)" }}>
            <DialogHeader>
              <DialogTitle style={{ color: "#e8edf5" }}>Add New Transaction</DialogTitle>
              <DialogDescription style={{ color: "#6b7ca0" }}>
                {role ? `Add a ${roleMeta?.label} transaction. AI will flag any suspicious activity.` : "Add a transaction. AI will categorize it automatically."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label style={{ color: "#94a3b8" }}>Description / Merchant</Label>
                <Input
                  placeholder={
                    role === "business" ? "e.g., RawMat Supplies Co." :
                    role === "student"  ? "e.g., Zomato, Coursera" :
                    role === "home"     ? "e.g., Big Basket, Electricity Board" :
                    role === "freelancer" ? "e.g., TechNova Solutions" :
                    "e.g., Starbucks"
                  }
                  value={newTransaction.merchant}
                  onChange={(e) => setNewTransaction({ ...newTransaction, merchant: e.target.value })}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8edf5" }}
                />
              </div>
              <div>
                <Label style={{ color: "#94a3b8" }}>Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8edf5" }}
                />
              </div>
              <div>
                <Label style={{ color: "#94a3b8" }}>Type</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value })}
                >
                  <SelectTrigger style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8edf5" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: "#0e1423", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label style={{ color: "#94a3b8" }}>Category</Label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                >
                  <SelectTrigger style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8edf5" }}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "#0e1423", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {activeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: cat.color }} />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label style={{ color: "#94a3b8" }}>Payment Mode</Label>
                <Select
                  value={newTransaction.paymentMode}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, paymentMode: value })}
                >
                  <SelectTrigger style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8edf5" }}>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "#0e1423", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="NEFT/RTGS">NEFT / RTGS</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Auto Pay">Auto Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", background: "transparent" }}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}
                style={{ background: accentColor, color: "#fff", border: "none" }}>
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4" style={glassCard}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6b7ca0" }} />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8edf5" }}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8edf5" }}>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent style={{ background: "#0e1423", border: "1px solid rgba(255,255,255,0.1)" }}>
              <SelectItem value="all">All Categories</SelectItem>
              {activeCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e8edf5" }}>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent style={{ background: "#0e1423", border: "1px solid rgba(255,255,255,0.1)" }}>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Transactions", value: filteredTransactions.length, mono: false, prefix: "" },
          { label: "Total Expenses", value: `₹${totalExpenses.toFixed(2)}`, color: "#ef4444", mono: true, prefix: "" },
          { label: "Total Income", value: `₹${totalIncome.toFixed(2)}`, color: "#10b981", mono: true, prefix: "" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={glassCard}>
            <p className="text-sm mb-1" style={{ color: "#6b7ca0" }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color || "#e8edf5", fontFamily: s.mono ? "monospace" : undefined }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl p-6" style={glassCard}>
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: "#6b7ca0" }}>No transactions found</p>
              <p className="text-sm mt-1" style={{ color: "#3d4f6b" }}>
                {role ? `Add your first ${roleMeta?.label.toLowerCase()} transaction above` : "Add a transaction to get started"}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const catColor =
                activeCategories.find((c) => c.id === transaction.category)?.color || accentColor;
              const isRisk = (transaction.risk_score || transaction.riskScore || 0) > 0.7;
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl transition-all"
                  style={{
                    background: isRisk ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.02)",
                    border: isRisk ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: transaction.type === "income" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.08)",
                      }}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-5 h-5" style={{ color: "#10b981" }} />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" style={{ color: "#ef4444" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium truncate" style={{ color: "#e8edf5" }}>{transaction.merchant}</p>
                        {isRisk && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                            <AlertTriangle className="w-3 h-3" /> High Risk
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs" style={{ color: "#6b7ca0" }}>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: catColor }} />
                          {activeCategories.find((c) => c.id === transaction.category)?.name || transaction.category}
                        </span>
                        <span>·</span>
                        <span>{transaction.payment_mode || transaction.paymentMode}</span>
                        <span>·</span>
                        <span>{new Date(transaction.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold" style={{
                        color: transaction.type === "income" ? "#10b981" : "#e8edf5",
                        fontFamily: "monospace",
                      }}>
                        {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                      </p>
                      {(transaction.risk_score || transaction.riskScore || 0) > 0.5 && (
                        <p className="text-xs" style={{ color: "#f59e0b" }}>
                          Risk: {((transaction.risk_score || transaction.riskScore) * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: "rgba(239,68,68,0.08)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
