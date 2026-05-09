import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
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
import {
  Target,
  TrendingUp,
  Plus,
  Trophy,
  Zap,
  Calendar,
  DollarSign,
  Flame,
  Award,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { goalsAPI } from "../../utils/api/transactions";
import confetti from "canvas-confetti";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addAmount, setAddAmount] = useState<Record<string, string>>({});
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    deadline: "",
    category: "savings",
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.getAll();
      setGoals(response.goals || []);
    } catch (error) {
      console.error('Failed to load goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await goalsAPI.create({
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target),
        current_amount: 0,
        deadline: new Date(newGoal.deadline).toISOString(),
        category: newGoal.category,
      });

      await loadGoals();
      setIsAddDialogOpen(false);
      setNewGoal({ name: "", target: "", deadline: "", category: "savings" });
      toast.success("Goal created successfully!");
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const handleAddMoney = async (goalId: string) => {
    const amount = parseFloat(addAmount[goalId] || "0");
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newAmount = goal.current_amount_amount + amount;
      await goalsAPI.update(goalId, {
        current_amount: newAmount,
      });

      // Check if goal is achieved
      if (newAmount >= goal.target_amount_amount && goal.current_amount_amount < goal.target_amount_amount) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`🎉 Congratulations! You've achieved your "${goal.name}" goal!`);
      } else {
        toast.success("Progress updated!");
      }

      await loadGoals();
      setAddAmount({ ...addAmount, [goalId]: "" });
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      savings: "🏦",
      travel: "✈️",
      tech: "💻",
      home: "🏠",
      car: "🚗",
      education: "📚",
      health: "💪",
      custom: "🎯",
    };
    return emojis[category] || "🎯";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  const streakDays = 47;
  const achievements = [
    { icon: "🔥", title: "47 Day Streak", desc: "Keep going!" },
    { icon: "🏆", title: "Goal Master", desc: "Completed 5 goals" },
    { icon: "⭐", title: "Super Saver", desc: "Saved $1000 this month" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Savings Goals</h1>
          <p className="text-gray-600 mt-1">Track progress and achieve your financial dreams</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
              <DialogDescription>
                Set a target and deadline for your savings goal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="emoji">Goal Emoji</Label>
                <Input
                  id="emoji"
                  placeholder="🎯"
                  value={newGoal.emoji}
                  onChange={(e) => setNewGoal({ ...newGoal, emoji: e.target.value })}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., New Car"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="target">Target Amount</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="0.00"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress */}
      <Card className="p-6 bg-gradient-to-br from-green-500 to-blue-500 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Overall Savings Progress</h3>
            <p className="text-white/80">
              ${totalSaved.toLocaleString()} of ${totalTarget.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{overallProgress.toFixed(0)}%</div>
            <div className="text-white/80">Complete</div>
          </div>
        </div>
        <Progress value={overallProgress} className="[&>div]:bg-white h-3" />
      </Card>

      {/* Streak & Achievements */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold">{streakDays} Days</p>
              <p className="text-gray-600">Savings Streak 🔥</p>
              <p className="text-sm text-gray-500">You're on fire! Keep it up</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold">Level 12</p>
              <p className="text-gray-600">Saver Rank 🏆</p>
              <p className="text-sm text-gray-500">850 XP to next level</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Recent Achievements</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {achievements.map((achievement, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200"
            >
              <div className="text-4xl">{achievement.icon}</div>
              <div>
                <div className="font-bold">{achievement.title}</div>
                <div className="text-sm text-gray-600">{achievement.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Goals List */}
      <div className="grid gap-4">
        {goals.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          const daysLeft = Math.ceil(
            (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          const monthlyRequired =
            daysLeft > 0 ? ((goal.target_amount - goal.current_amount) / daysLeft) * 30 : 0;

          return (
            <Card key={goal.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getCategoryEmoji(goal.category)}</div>
                    <div>
                      <h3 className="font-bold text-xl">{goal.name}</h3>
                      <p className="text-sm text-gray-600">
                        ${goal.current_amount.toLocaleString()} of ${goal.target_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {progress.toFixed(0)}%
                    </div>
                    {progress >= 100 ? (
                      <Badge className="bg-green-500">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">{daysLeft} days left</Badge>
                    )}
                  </div>
                </div>

                <Progress value={Math.min(progress, 100)} className="h-3" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Remaining</span>
                    </div>
                    <p className="font-bold">${(goal.target_amount - goal.current_amount).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600">Per Month</span>
                    </div>
                    <p className="font-bold text-blue-600">
                      ${monthlyRequired.toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Progress</span>
                    </div>
                    <p className="font-bold text-green-600">
                      +${(goal.current_amount * 0.05).toFixed(0)} this week
                    </p>
                  </div>
                </div>

                {progress < 100 && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={addAmount[goal.id] || ""}
                      onChange={(e) => setAddAmount({ ...addAmount, [goal.id]: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleAddMoney(goal.id)}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* AI Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">AI Savings Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>
                  You're spending 23% more on food delivery than last month. Redirecting half
                  could add $140 to your goals this month.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>
                  Your vacation goal is on track! Maintain current savings rate to reach it 2
                  weeks early.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>
                  Consider setting up auto-transfer of $250/week to accelerate your emergency
                  fund goal.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
