import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { budgets as mockBudgets, categories } from "../data/mockData";
import { Plus, TrendingUp, AlertCircle, CheckCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Budget() {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "",
    limit: "",
  });

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.limit) {
      toast.error("Please fill in all fields");
      return;
    }

    const existingBudget = budgets.find((b) => b.category === newBudget.category);
    if (existingBudget) {
      toast.error("Budget already exists for this category");
      return;
    }

    const budget = {
      category: newBudget.category,
      limit: parseFloat(newBudget.limit),
      spent: 0,
      predicted: 0,
    };

    setBudgets([...budgets, budget]);
    setIsAddDialogOpen(false);
    setNewBudget({ category: "", limit: "" });
    toast.success("Budget created successfully!");
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalPredicted = budgets.reduce((sum, b) => sum + b.predicted, 0);

  const chartData = budgets.map((budget) => ({
    category: budget.category.charAt(0).toUpperCase() + budget.category.slice(1),
    Budget: budget.limit,
    Spent: budget.spent,
    Predicted: budget.predicted,
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Budget Planner</h1>
          <p className="text-gray-600 mt-1">Set limits and track spending with AI predictions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category. AI will track and predict your spending.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => !budgets.find((b) => b.category === cat.id))
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limit">Monthly Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  placeholder="0.00"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBudget}>Create Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold mt-1">${totalBudget.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Monthly limit</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold mt-1">${totalSpent.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                totalSpent > totalBudget ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {totalSpent > totalBudget ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Prediction</p>
              <p className="text-2xl font-bold mt-1">${totalPredicted.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Expected by month end</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Budget vs Spent Chart */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Budget Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Budget" fill="#3b82f6" />
            <Bar dataKey="Spent" fill="#ef4444" />
            <Bar dataKey="Predicted" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Budget Details */}
      <div className="grid gap-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = percentage > 100;
          const predictedPercentage = (budget.predicted / budget.limit) * 100;
          const category = categories.find((c) => c.id === budget.category);

          return (
            <Card key={budget.category} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg capitalize">{budget.category}</h3>
                      <p className="text-sm text-gray-600">
                        ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        isOverBudget ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {percentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-500">used</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={isOverBudget ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-500"}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Remaining: ${Math.max(0, budget.limit - budget.spent).toFixed(2)}
                    </span>
                    <span className="text-purple-600">
                      Predicted: ${budget.predicted.toFixed(2)} (
                      {predictedPercentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                {isOverBudget && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      You've exceeded this budget by $
                      {(budget.spent - budget.limit).toFixed(2)}
                    </p>
                  </div>
                )}

                {!isOverBudget && predictedPercentage > 100 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      AI predicts you'll exceed this budget by $
                      {(budget.predicted - budget.limit).toFixed(2)}
                    </p>
                  </div>
                )}

                {!isOverBudget && predictedPercentage <= 100 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      On track! AI predicts you'll stay within budget
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}