import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware to verify user authentication
async function verifyAuth(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }

  c.set('userId', data.user.id);
  c.set('user', data.user);
  await next();
}

// Health check endpoint
app.get("/make-server-be23ac86/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTH ROUTES =====
app.post("/make-server-be23ac86/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create user with auto email confirmation (since email server not configured)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since no email server configured
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user, message: 'User created successfully' });
  } catch (error: any) {
    console.log('Signup error:', error);
    return c.json({ error: error.message || 'Signup failed' }, 500);
  }
});

// ===== TRANSACTION ROUTES =====
app.get("/make-server-be23ac86/transactions", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const transactions = await kv.getByPrefix(`user:${userId}:transaction:`);

    return c.json({
      transactions: transactions.map(t => t.value).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    });
  } catch (error: any) {
    console.log('Get transactions error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-be23ac86/transactions", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const transaction = await c.req.json();

    const id = crypto.randomUUID();
    const newTransaction = {
      ...transaction,
      id,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:transaction:${id}`, newTransaction);

    return c.json({ transaction: newTransaction });
  } catch (error: any) {
    console.log('Create transaction error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put("/make-server-be23ac86/transactions/:id", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const updates = await c.req.json();

    const existing = await kv.get(`user:${userId}:transaction:${id}`);
    if (!existing) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    const updated = { ...existing, ...updates, id, user_id: userId };
    await kv.set(`user:${userId}:transaction:${id}`, updated);

    return c.json({ transaction: updated });
  } catch (error: any) {
    console.log('Update transaction error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete("/make-server-be23ac86/transactions/:id", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');

    await kv.del(`user:${userId}:transaction:${id}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.log('Delete transaction error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== BUDGET ROUTES =====
app.get("/make-server-be23ac86/budgets", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const budgets = await kv.getByPrefix(`user:${userId}:budget:`);

    return c.json({ budgets: budgets.map(b => b.value) });
  } catch (error: any) {
    console.log('Get budgets error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-be23ac86/budgets", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const budget = await c.req.json();

    const id = crypto.randomUUID();
    const newBudget = {
      ...budget,
      id,
      user_id: userId,
      spent: 0,
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:budget:${id}`, newBudget);

    return c.json({ budget: newBudget });
  } catch (error: any) {
    console.log('Create budget error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== GOALS ROUTES =====
app.get("/make-server-be23ac86/goals", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const goals = await kv.getByPrefix(`user:${userId}:goal:`);

    return c.json({ goals: goals.map(g => g.value) });
  } catch (error: any) {
    console.log('Get goals error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-be23ac86/goals", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const goal = await c.req.json();

    const id = crypto.randomUUID();
    const newGoal = {
      ...goal,
      id,
      user_id: userId,
      current_amount: goal.current_amount || 0,
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:goal:${id}`, newGoal);

    return c.json({ goal: newGoal });
  } catch (error: any) {
    console.log('Create goal error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put("/make-server-be23ac86/goals/:id", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const updates = await c.req.json();

    const existing = await kv.get(`user:${userId}:goal:${id}`);
    if (!existing) {
      return c.json({ error: 'Goal not found' }, 404);
    }

    const updated = { ...existing, ...updates, id, user_id: userId };
    await kv.set(`user:${userId}:goal:${id}`, updated);

    return c.json({ goal: updated });
  } catch (error: any) {
    console.log('Update goal error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== AI INSIGHTS ROUTES =====
app.get("/make-server-be23ac86/insights", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const transactions = await kv.getByPrefix(`user:${userId}:transaction:`);
    const budgets = await kv.getByPrefix(`user:${userId}:budget:`);

    const txs = transactions.map(t => t.value);
    const insights = generateInsights(txs, budgets.map(b => b.value));

    return c.json({ insights });
  } catch (error: any) {
    console.log('Get insights error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== DATA SEEDING ROUTE =====
app.post("/make-server-be23ac86/seed-demo-data", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');

    // Check if user already has data
    const existingTransactions = await kv.getByPrefix(`user:${userId}:transaction:`);
    if (existingTransactions.length > 0) {
      return c.json({ message: 'User already has data' });
    }

    // Seed sample transactions
    const sampleTransactions = [
      {
        merchant: "Whole Foods Market",
        amount: 87.45,
        category: "groceries",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: "expense",
        payment_mode: "Credit Card",
        risk_score: 0.1,
        status: "normal",
      },
      {
        merchant: "Company Inc",
        amount: 4500.00,
        category: "salary",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        type: "income",
        payment_mode: "Bank Transfer",
        risk_score: 0.05,
        status: "normal",
      },
      {
        merchant: "Shell Gas Station",
        amount: 65.00,
        category: "fuel",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: "expense",
        payment_mode: "Credit Card",
        risk_score: 0.1,
        status: "normal",
      },
      {
        merchant: "Amazon",
        amount: 234.00,
        category: "shopping",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: "expense",
        payment_mode: "Credit Card",
        risk_score: 0.15,
        status: "normal",
      },
      {
        merchant: "Netflix",
        amount: 15.99,
        category: "entertainment",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: "expense",
        payment_mode: "Credit Card",
        risk_score: 0.05,
        status: "normal",
      },
    ];

    for (const tx of sampleTransactions) {
      const id = crypto.randomUUID();
      await kv.set(`user:${userId}:transaction:${id}`, {
        ...tx,
        id,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    }

    // Seed sample budgets
    const sampleBudgets = [
      { category: "groceries", limit: 500, period: "monthly" },
      { category: "fuel", limit: 200, period: "monthly" },
      { category: "shopping", limit: 300, period: "monthly" },
      { category: "food", limit: 400, period: "monthly" },
    ];

    for (const budget of sampleBudgets) {
      const id = crypto.randomUUID();
      await kv.set(`user:${userId}:budget:${id}`, {
        ...budget,
        id,
        user_id: userId,
        spent: 0,
        created_at: new Date().toISOString(),
      });
    }

    // Seed sample goal
    const goalId = crypto.randomUUID();
    await kv.set(`user:${userId}:goal:${goalId}`, {
      id: goalId,
      user_id: userId,
      name: "Emergency Fund",
      target_amount: 10000,
      current_amount: 2500,
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      category: "savings",
      created_at: new Date().toISOString(),
    });

    return c.json({ message: 'Demo data seeded successfully' });
  } catch (error: any) {
    console.log('Seed data error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== INVESTMENT ROUTES =====
app.get("/make-server-be23ac86/investments", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const investments = await kv.getByPrefix(`user:${userId}:investment:`);
    return c.json({ investments: investments.map(i => i.value) });
  } catch (error: any) {
    console.log('Get investments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-be23ac86/investments", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const investment = await c.req.json();

    const id = crypto.randomUUID();
    const newInvestment = {
      ...investment,
      id,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:investment:${id}`, newInvestment);
    return c.json({ investment: newInvestment });
  } catch (error: any) {
    console.log('Create investment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put("/make-server-be23ac86/investments/:id", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const updates = await c.req.json();

    const existing = await kv.get(`user:${userId}:investment:${id}`);
    if (!existing) {
      return c.json({ error: 'Investment not found' }, 404);
    }

    const updated = { ...existing, ...updates, id, user_id: userId };
    await kv.set(`user:${userId}:investment:${id}`, updated);
    return c.json({ investment: updated });
  } catch (error: any) {
    console.log('Update investment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete("/make-server-be23ac86/investments/:id", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    await kv.del(`user:${userId}:investment:${id}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.log('Delete investment error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== BILL REMINDER ROUTES =====
app.get("/make-server-be23ac86/bills", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const bills = await kv.getByPrefix(`user:${userId}:bill:`);
    return c.json({ bills: bills.map(b => b.value) });
  } catch (error: any) {
    console.log('Get bills error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-be23ac86/bills", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const bill = await c.req.json();

    const id = crypto.randomUUID();
    const newBill = {
      ...bill,
      id,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:bill:${id}`, newBill);
    return c.json({ bill: newBill });
  } catch (error: any) {
    console.log('Create bill error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete("/make-server-be23ac86/bills/:id", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    await kv.del(`user:${userId}:bill:${id}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.log('Delete bill error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== RECEIPT ROUTES =====
app.post("/make-server-be23ac86/receipts", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const receipt = await c.req.json();

    const id = crypto.randomUUID();
    const newReceipt = {
      ...receipt,
      id,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:receipt:${id}`, newReceipt);
    return c.json({ receipt: newReceipt });
  } catch (error: any) {
    console.log('Save receipt error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/make-server-be23ac86/receipts", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const receipts = await kv.getByPrefix(`user:${userId}:receipt:`);
    return c.json({ receipts: receipts.map(r => r.value) });
  } catch (error: any) {
    console.log('Get receipts error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== FRAUD DETECTION ROUTE =====
app.post("/make-server-be23ac86/analyze-fraud", verifyAuth, async (c) => {
  try {
    const { transaction } = await c.req.json();
    const userId = c.get('userId');

    // Get user's transaction history for pattern analysis
    const historicalTxs = await kv.getByPrefix(`user:${userId}:transaction:`);
    const txs = historicalTxs.map(t => t.value);

    const fraudScore = calculateFraudScore(transaction, txs);
    const status = fraudScore > 0.7 ? 'suspicious' : fraudScore > 0.4 ? 'warning' : 'normal';

    return c.json({
      risk_score: fraudScore,
      status,
      reasons: getFraudReasons(transaction, txs, fraudScore)
    });
  } catch (error: any) {
    console.log('Fraud analysis error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== CSV BANK STATEMENT PARSER =====
app.post("/make-server-be23ac86/import-csv", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { csvData } = await c.req.json();

    const transactions = parseCSV(csvData);
    const imported = [];

    for (const tx of transactions) {
      const id = crypto.randomUUID();
      const newTx = {
        ...tx,
        id,
        user_id: userId,
        created_at: new Date().toISOString(),
        imported: true,
      };

      await kv.set(`user:${userId}:transaction:${id}`, newTx);
      imported.push(newTx);
    }

    return c.json({
      success: true,
      imported: imported.length,
      transactions: imported
    });
  } catch (error: any) {
    console.log('CSV import error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== EXPENSE PREDICTION =====
app.get("/make-server-be23ac86/predict-spending", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const transactions = await kv.getByPrefix(`user:${userId}:transaction:`);
    const txs = transactions.map(t => t.value);

    const predictions = predictSpending(txs);

    return c.json({ predictions });
  } catch (error: any) {
    console.log('Prediction error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== ANALYTICS ROUTE =====
app.get("/make-server-be23ac86/analytics", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const transactions = await kv.getByPrefix(`user:${userId}:transaction:`);
    const budgets = await kv.getByPrefix(`user:${userId}:budget:`);
    const goals = await kv.getByPrefix(`user:${userId}:goal:`);

    const txs = transactions.map(t => t.value);
    const analytics = generateAnalytics(txs, budgets.map(b => b.value), goals.map(g => g.value));

    return c.json({ analytics });
  } catch (error: any) {
    console.log('Analytics error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ===== HELPER FUNCTIONS =====

function calculateFraudScore(transaction: any, historicalTxs: any[]): number {
  let score = 0;

  // Rule 1: Unusually high amount
  const amounts = historicalTxs.filter(t => t.category === transaction.category).map(t => t.amount);
  if (amounts.length > 0) {
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length);

    if (transaction.amount > avgAmount + (2 * stdDev)) {
      score += 0.4;
    }
  }

  // Rule 2: Unusual time (late night transactions)
  const txHour = new Date(transaction.date).getHours();
  if (txHour >= 23 || txHour <= 4) {
    score += 0.2;
  }

  // Rule 3: High frequency in short time
  const recentTxs = historicalTxs.filter(t => {
    const hoursDiff = (new Date(transaction.date).getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 0 && hoursDiff <= 1;
  });

  if (recentTxs.length >= 3) {
    score += 0.3;
  }

  // Rule 4: Foreign or unusual merchant
  if (transaction.merchant?.toLowerCase().includes('international') ||
      transaction.merchant?.toLowerCase().includes('foreign')) {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

function getFraudReasons(transaction: any, historicalTxs: any[], score: number): string[] {
  const reasons = [];

  if (score > 0.7) {
    reasons.push('Transaction amount significantly higher than usual');
  }

  const txHour = new Date(transaction.date).getHours();
  if (txHour >= 23 || txHour <= 4) {
    reasons.push('Transaction occurred during unusual hours');
  }

  const recentCount = historicalTxs.filter(t => {
    const hoursDiff = (new Date(transaction.date).getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 0 && hoursDiff <= 1;
  }).length;

  if (recentCount >= 3) {
    reasons.push('Multiple transactions in short time period');
  }

  return reasons;
}

function parseCSV(csvData: string): any[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const tx: any = {};

    headers.forEach((header, index) => {
      if (header.includes('date')) tx.date = values[index];
      else if (header.includes('merchant') || header.includes('description')) tx.merchant = values[index];
      else if (header.includes('amount') || header.includes('debit') || header.includes('credit')) {
        const amount = parseFloat(values[index].replace(/[^0-9.-]/g, ''));
        tx.amount = Math.abs(amount);
        tx.type = amount < 0 ? 'expense' : 'income';
      }
      else if (header.includes('category')) tx.category = values[index];
    });

    // Auto-categorize if no category
    if (!tx.category) {
      tx.category = autoCategorize(tx.merchant || '');
    }

    if (tx.date && tx.amount) {
      tx.payment_mode = 'Bank Transfer';
      tx.risk_score = 0.05;
      tx.status = 'normal';
      transactions.push(tx);
    }
  }

  return transactions;
}

function autoCategorize(merchant: string): string {
  const merchantLower = merchant.toLowerCase();

  if (merchantLower.includes('grocery') || merchantLower.includes('market') || merchantLower.includes('food')) {
    return 'groceries';
  } else if (merchantLower.includes('gas') || merchantLower.includes('fuel') || merchantLower.includes('shell') || merchantLower.includes('exxon')) {
    return 'fuel';
  } else if (merchantLower.includes('restaurant') || merchantLower.includes('cafe') || merchantLower.includes('coffee')) {
    return 'food';
  } else if (merchantLower.includes('amazon') || merchantLower.includes('store') || merchantLower.includes('shop')) {
    return 'shopping';
  } else if (merchantLower.includes('netflix') || merchantLower.includes('spotify') || merchantLower.includes('hulu')) {
    return 'entertainment';
  } else if (merchantLower.includes('electric') || merchantLower.includes('water') || merchantLower.includes('utility')) {
    return 'utilities';
  } else if (merchantLower.includes('insurance')) {
    return 'insurance';
  } else if (merchantLower.includes('hospital') || merchantLower.includes('pharmacy') || merchantLower.includes('medical')) {
    return 'healthcare';
  }

  return 'other';
}

function predictSpending(transactions: any[]): any {
  const expenseTxs = transactions.filter(t => t.type === 'expense');

  // Calculate monthly average by category
  const categoryTotals: Record<string, number[]> = {};

  expenseTxs.forEach(tx => {
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = [];
    }
    categoryTotals[tx.category].push(tx.amount);
  });

  const predictions: any = {
    next_month_total: 0,
    by_category: {},
    confidence: 'medium',
  };

  Object.keys(categoryTotals).forEach(category => {
    const amounts = categoryTotals[category];
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const trend = amounts.length > 1 ? (amounts[amounts.length - 1] - amounts[0]) / amounts.length : 0;

    const predicted = avg + trend;
    predictions.by_category[category] = predicted;
    predictions.next_month_total += predicted;
  });

  return predictions;
}

function generateAnalytics(transactions: any[], budgets: any[], goals: any[]) {
  const expenseTxs = transactions.filter(t => t.type === 'expense');
  const incomeTxs = transactions.filter(t => t.type === 'income');

  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // Category breakdown
  const categorySpending: Record<string, number> = {};
  expenseTxs.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });

  // Spending trend (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayTotal = expenseTxs
      .filter(t => t.date.startsWith(dateStr))
      .reduce((sum, t) => sum + t.amount, 0);

    last7Days.push({ date: dateStr, amount: dayTotal });
  }

  // Financial health score
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  let healthScore = 50;

  if (savingsRate > 20) healthScore += 30;
  else if (savingsRate > 10) healthScore += 15;

  const budgetCompliance = budgets.filter(b => {
    const spent = categorySpending[b.category] || 0;
    return spent <= b.limit;
  }).length / Math.max(budgets.length, 1);

  healthScore += budgetCompliance * 20;

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    net_savings: netSavings,
    savings_rate: savingsRate,
    financial_health_score: Math.round(healthScore),
    category_spending: categorySpending,
    spending_trend: last7Days,
    budget_compliance: budgetCompliance * 100,
  };
}

function generateInsights(transactions: any[], budgets: any[]) {
  const insights = [];

  // Calculate total spending
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Category analysis
  const categorySpending: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

  const topCategory = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)[0];

  if (topCategory) {
    insights.push({
      type: 'spending_pattern',
      title: 'Top Spending Category',
      description: `You've spent $${topCategory[1].toFixed(2)} on ${topCategory[0]} this month`,
      priority: 'high',
    });
  }

  // Budget alerts
  budgets.forEach(budget => {
    const categorySpent = categorySpending[budget.category] || 0;
    const percentage = (categorySpent / budget.limit) * 100;

    if (percentage > 90) {
      insights.push({
        type: 'budget_alert',
        title: 'Budget Warning',
        description: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget`,
        priority: 'critical',
      });
    } else if (percentage > 75) {
      insights.push({
        type: 'budget_alert',
        title: 'Budget Notice',
        description: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget`,
        priority: 'medium',
      });
    }
  });

  // Fraud detection
  const suspiciousTransactions = transactions.filter(t => t.risk_score > 0.7);
  if (suspiciousTransactions.length > 0) {
    insights.push({
      type: 'fraud_alert',
      title: 'Suspicious Activity Detected',
      description: `${suspiciousTransactions.length} transactions flagged for review`,
      priority: 'critical',
    });
  }

  // Savings opportunity
  if (totalSpent > 0) {
    const avgDaily = totalSpent / 30;
    const savingsPotential = avgDaily * 0.1 * 30;
    insights.push({
      type: 'savings_opportunity',
      title: 'Savings Opportunity',
      description: `By reducing daily spending by 10%, you could save $${savingsPotential.toFixed(2)} monthly`,
      priority: 'medium',
    });
  }

  // Spending trend insight
  const recentTxs = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  if (recentTxs.length >= 5) {
    const recentTotal = recentTxs.reduce((sum, t) => sum + t.amount, 0);
    const avgPerDay = recentTotal / 7;

    if (avgPerDay > totalSpent / 30) {
      insights.push({
        type: 'spending_trend',
        title: 'Increased Spending Detected',
        description: `Your daily spending is ${((avgPerDay / (totalSpent / 30) - 1) * 100).toFixed(0)}% higher than usual`,
        priority: 'medium',
      });
    }
  }

  return insights;
}

Deno.serve(app.fetch);