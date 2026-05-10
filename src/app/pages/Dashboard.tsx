import { weeklyData, categorySpending } from "../data/mockData";
import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Link } from "react-router";
import { transactionsAPI, budgetsAPI, aiAPI } from "../../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const COLORS = [
  "#10b981",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#06b6d4",
  "#84cc16",
  "#3b82f6",
  "#8b5cf6",
  "#6366f1",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txResponse, budgetResponse, insightsResponse] = await Promise.all([
        transactionsAPI.getAll(),
        budgetsAPI.getAll(),
        aiAPI.getInsights(),
      ]);

      setTransactions(txResponse.transactions || []);
      setBudgets(budgetResponse.budgets || []);
      setInsights(insightsResponse.insights || []);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load data. Using demo mode.');
      // Set empty arrays as fallback
      setTransactions([]);
      setBudgets([]);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const todayExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date).toDateString() === new Date().toDateString()
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const suspiciousTransactions = transactions.filter((t) => (t.risk_score || t.riskScore || 0) > 0.7);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-gray-600 mt-1">Here's your financial overview</p>
        </div>
        <Link to="/app/transactions">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold mt-1">${balance.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold mt-1">${totalIncome.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                This month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold mt-1">${totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                This month
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Spending</p>
              <p className="text-2xl font-bold mt-1">${todayExpenses.toFixed(2)}</p>
              <p className="text-sm text-orange-600 mt-1 flex items-center">
                <ShoppingCart className="w-4 h-4 mr-1" />
                {transactions.filter((t) => t.type === "expense" && new Date(t.date).toDateString() === new Date().toDateString()).length} transactions
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Fraud Alert */}
      {suspiciousTransactions.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-900">Suspicious Activity Detected</h3>
              <p className="text-sm text-red-700 mt-1">
                {suspiciousTransactions.length} potentially fraudulent{" "}
                {suspiciousTransactions.length === 1 ? "transaction" : "transactions"} detected.
                Please review immediately.
              </p>
              <Link to="/app/alerts">
                <Button size="sm" variant="destructive" className="mt-3">
                  Review Alerts
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Spending */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Weekly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="spent" stroke="#3b82f6" strokeWidth={2} name="Actual" />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-600">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600">Predicted</span>
            </div>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categorySpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Budget Overview</h3>
          <Link to="/app/budget">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.slice(0, 6).map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const isOverBudget = percentage > 100;
            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{budget.category}</span>
                  <span className={`text-sm ${isOverBudget ? "text-red-600" : "text-gray-600"}`}>
                    ${budget.spent} / ${budget.limit}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={isOverBudget ? "[&>div]:bg-red-500" : ""}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{percentage.toFixed(0)}% used</span>
                  <span>Predicted: ${budget.predicted}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">AI-Powered Insights</h3>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${
                insight.type === "warning"
                  ? "bg-orange-50 border-orange-200"
                  : insight.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <h4 className="font-medium mb-1">{insight.title}</h4>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Recent Transactions</h3>
          <Link to="/app/transactions">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.merchant}</p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-medium ${
                    transaction.type === "income" ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}