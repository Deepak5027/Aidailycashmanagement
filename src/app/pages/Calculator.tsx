import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Calculator as CalcIcon, TrendingDown, TrendingUp, Wallet, PiggyBank, Percent, Calendar, DollarSign } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Calculator() {
  const { t } = useTranslation();
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [weeklyBudget, setWeeklyBudget] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [expenses, setExpenses] = useState<Array<{ name: string; category: string; amount: number }>>([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('food');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [whatIfCategory, setWhatIfCategory] = useState('food');
  const [whatIfReduction, setWhatIfReduction] = useState('');

  const totalBudget = (parseFloat(monthlyBudget) || 0) + (parseFloat(weeklyBudget) || 0) * 4 + (parseFloat(dailyBudget) || 0) * 30;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = totalBudget - totalExpenses;
  const savingsAmount = remaining > 0 ? remaining : 0;
  const savingsPercent = totalBudget > 0 ? (savingsAmount / totalBudget) * 100 : 0;
  const expensePercent = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  const dailyLimit = totalBudget / 30;
  const weeklyLimit = totalBudget / 4;

  const handleCalcClick = (value: string) => {
    if (value === 'C') {
      setCalcDisplay('0');
    } else if (value === '←') {
      setCalcDisplay(calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0');
    } else if (value === '=') {
      try {
        const result = eval(calcDisplay.replace('×', '*').replace('÷', '/'));
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay(calcDisplay === '0' ? value : calcDisplay + value);
    }
  };

  const insertToField = (field: 'budget' | 'expense') => {
    if (field === 'budget') {
      setMonthlyBudget(calcDisplay);
    } else {
      setExpenseAmount(calcDisplay);
    }
  };

  const addExpense = () => {
    if (expenseName && expenseAmount) {
      setExpenses([...expenses, {
        name: expenseName,
        category: expenseCategory,
        amount: parseFloat(expenseAmount)
      }]);
      setExpenseName('');
      setExpenseAmount('');
    }
  };

  const categoryExpenses = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryExpenses).map(([category, amount]) => ({
    name: t(category),
    value: amount
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const whatIfTotal = expenses.reduce((sum, exp) => {
    if (exp.category === whatIfCategory) {
      return sum + Math.max(0, exp.amount - (parseFloat(whatIfReduction) || 0));
    }
    return sum + exp.amount;
  }, 0);

  const whatIfSavings = totalBudget - whatIfTotal;
  const whatIfGrowth = whatIfSavings * 12; // Annual projection

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <CalcIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">{t('budgetCalculator')}</h1>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">{t('calculator')}</TabsTrigger>
          <TabsTrigger value="whatif">{t('whatIfCalculator')}</TabsTrigger>
          <TabsTrigger value="mini">Mini Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          {/* Budget Input */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Input</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{t('monthlyBudget')}</Label>
                <Input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="₹0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('weeklyBudget')}</Label>
                <Input
                  type="number"
                  value={weeklyBudget}
                  onChange={(e) => setWeeklyBudget(e.target.value)}
                  placeholder="₹0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('dailyBudget')}</Label>
                <Input
                  type="number"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  placeholder="₹0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Expense Input */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Expense Name</Label>
                  <Input
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    placeholder="e.g., Groceries"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">{t('food')}</SelectItem>
                      <SelectItem value="transport">{t('transport')}</SelectItem>
                      <SelectItem value="entertainment">{t('entertainment')}</SelectItem>
                      <SelectItem value="groceries">{t('groceries')}</SelectItem>
                      <SelectItem value="shopping">{t('shopping')}</SelectItem>
                      <SelectItem value="bills">{t('bills')}</SelectItem>
                      <SelectItem value="health">{t('health')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="₹0"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addExpense} className="w-full">{t('add')}</Button>
                </div>
              </div>
              {expenses.length > 0 && (
                <div className="space-y-2">
                  {expenses.map((exp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{exp.name} ({t(exp.category)})</span>
                      <span className="font-semibold">₹{exp.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalBudget')}</CardTitle>
                <Wallet className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalBudget.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalExpenses')}</CardTitle>
                <TrendingDown className="size-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">₹{totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('remainingAmount')}</CardTitle>
                <DollarSign className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{remaining.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('savingsAmount')}</CardTitle>
                <PiggyBank className="size-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{savingsAmount.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bars */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="size-5" />
                  {t('savingsPercentage')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-green-600">{savingsPercent.toFixed(1)}%</div>
                <Progress value={savingsPercent} className="h-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="size-5" />
                  {t('expensePercentage')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-bold text-destructive">{expensePercent.toFixed(1)}%</div>
                <Progress value={expensePercent} className="h-3" />
              </CardContent>
            </Card>
          </div>

          {/* Spending Limits */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  {t('dailySpendingLimit')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{dailyLimit.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  {t('weeklySpendingLimit')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{weeklyLimit.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown Chart */}
          {pieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="whatif" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('whatIfCalculator')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Select Category</Label>
                  <Select value={whatIfCategory} onValueChange={setWhatIfCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">{t('food')}</SelectItem>
                      <SelectItem value="transport">{t('transport')}</SelectItem>
                      <SelectItem value="entertainment">{t('entertainment')}</SelectItem>
                      <SelectItem value="groceries">{t('groceries')}</SelectItem>
                      <SelectItem value="shopping">{t('shopping')}</SelectItem>
                      <SelectItem value="bills">{t('bills')}</SelectItem>
                      <SelectItem value="health">{t('health')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reduce by Amount</Label>
                  <Input
                    type="number"
                    value={whatIfReduction}
                    onChange={(e) => setWhatIfReduction(e.target.value)}
                    placeholder="₹0"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-sm">New Savings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{whatIfSavings.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +₹{(whatIfSavings - savingsAmount).toFixed(2)} more
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-sm">New Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{(totalBudget - whatIfTotal).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-sm">Annual Savings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{whatIfGrowth.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mini" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mini Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-right text-3xl font-mono">
                {calcDisplay}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                  <Button
                    key={btn}
                    variant={['+', '-', '×', '÷', '='].includes(btn) ? 'default' : 'outline'}
                    onClick={() => handleCalcClick(btn)}
                    className="h-12 text-lg"
                  >
                    {btn}
                  </Button>
                ))}
                <Button variant="destructive" onClick={() => handleCalcClick('C')} className="h-12">C</Button>
                <Button variant="secondary" onClick={() => handleCalcClick('←')} className="h-12">←</Button>
                <Button variant="secondary" onClick={() => handleCalcClick('%')} className="h-12">%</Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button onClick={() => insertToField('budget')} variant="outline">
                  Insert to Budget
                </Button>
                <Button onClick={() => insertToField('expense')} variant="outline">
                  Insert to Expense
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
