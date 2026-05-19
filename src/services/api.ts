import { supabase } from '../lib/supabase';

// Helper to get current user ID
async function getUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user.id;
}

// Transactions API
export const transactionsAPI = {
  async getAll() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return { transactions: data || [] };
  },

  async create(transaction: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return { transaction: data };
  },

  async update(id: string, updates: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { transaction: data };
  },

  async delete(id: string) {
    const userId = await getUserId();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },
};

// Budgets API
export const budgetsAPI = {
  async getAll() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { budgets: data || [] };
  },

  async create(budget: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('budgets')
      .insert([{ ...budget, user_id: userId, spent: 0 }])
      .select()
      .single();

    if (error) throw error;
    return { budget: data };
  },

  async update(id: string, updates: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { budget: data };
  },

  async delete(id: string) {
    const userId = await getUserId();
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },
};

// Goals API
export const goalsAPI = {
  async getAll() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { goals: data || [] };
  },

  async create(goal: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, user_id: userId, current_amount: 0 }])
      .select()
      .single();

    if (error) throw error;
    return { goal: data };
  },

  async update(id: string, updates: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { goal: data };
  },

  async delete(id: string) {
    const userId = await getUserId();
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },
};

// Investments API
export const investmentsAPI = {
  async getAll() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { investments: data || [] };
  },

  async create(investment: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('investments')
      .insert([{ ...investment, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return { investment: data };
  },

  async update(id: string, updates: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('investments')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { investment: data };
  },

  async delete(id: string) {
    const userId = await getUserId();
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },
};

// Bills API
export const billsAPI = {
  async getAll() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return { bills: data || [] };
  },

  async create(bill: any) {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('bills')
      .insert([{ ...bill, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return { bill: data };
  },

  async delete(id: string) {
    const userId = await getUserId();
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },
};

// Receipts API
export const receiptsAPI = {
  async getAll() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { receipts: data || [] };
  },

  async save(receipt: any) {
    const userId = await getUserId();

    // Save receipt
    const { data: receiptData, error: receiptError } = await supabase
      .from('receipts')
      .insert([{
        user_id: userId,
        merchant: receipt.merchant,
        total: receipt.total,
        date: receipt.date || new Date().toISOString(),
        image_url: receipt.image_url,
      }])
      .select()
      .single();

    if (receiptError) throw receiptError;

    // Save receipt items if any
    if (receipt.items && receipt.items.length > 0) {
      const items = receipt.items.map((item: any) => ({
        receipt_id: receiptData.id,
        item_name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(items);

      if (itemsError) throw itemsError;
    }

    // Create transaction from receipt
    const { error: txError } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        merchant: receipt.merchant,
        amount: receipt.total,
        category: receipt.category || 'shopping',
        date: receipt.date || new Date().toISOString(),
        type: 'expense',
        payment_mode: 'cash',
        receipt_url: receipt.image_url,
        risk_score: 0,
        status: 'normal',
      }]);

    if (txError) throw txError;

    return { receipt: receiptData };
  },
};

// AI & Analytics API
export const aiAPI = {
  async getInsights() {
    const userId = await getUserId();

    // Get transactions for analysis
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(100);

    if (!transactions || transactions.length === 0) {
      return { insights: [] };
    }

    const insights: any[] = [];

    // Calculate spending trends
    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Check for high spending
    if (totalSpent > 5000) {
      insights.push({
        type: 'warning',
        title: 'High Spending Alert',
        description: `You've spent $${totalSpent.toFixed(2)} this period. Consider reviewing your budget.`,
      });
    }

    // Check for suspicious transactions
    const suspiciousCount = transactions.filter(t => (t.risk_score || 0) > 0.7).length;
    if (suspiciousCount > 0) {
      insights.push({
        type: 'fraud_alert',
        title: 'Suspicious Activity Detected',
        description: `${suspiciousCount} potentially fraudulent transactions detected. Review immediately.`,
      });
    }

    // Savings opportunity
    const avgDailySpending = totalSpent / 30;
    if (avgDailySpending > 100) {
      insights.push({
        type: 'savings_opportunity',
        title: 'Savings Opportunity',
        description: `By reducing daily spending by $20, you could save $600 this month.`,
      });
    }

    return { insights };
  },

  async analyzeFraud(transaction: any) {
    const userId = await getUserId();

    // Get historical transactions
    const { data: historical } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('category', transaction.category)
      .order('date', { ascending: false })
      .limit(50);

    let score = 0;

    if (historical && historical.length > 0) {
      const amounts = historical.map(t => t.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(
        amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length
      );

      // Unusually high amount
      if (transaction.amount > avgAmount + 2 * stdDev) {
        score += 0.4;
      }

      // Very high amount
      if (transaction.amount > avgAmount * 3) {
        score += 0.3;
      }
    }

    // Unusual time (late night)
    const hour = new Date(transaction.date).getHours();
    if (hour >= 23 || hour <= 4) {
      score += 0.2;
    }

    // Round number (suspicious pattern)
    if (transaction.amount % 100 === 0 && transaction.amount >= 500) {
      score += 0.1;
    }

    const riskScore = Math.min(score, 1.0);
    return {
      risk_score: riskScore,
      is_suspicious: riskScore > 0.7,
      status: riskScore > 0.7 ? 'suspicious' : 'normal',
    };
  },

  async getAnalytics() {
    const userId = await getUserId();

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (!transactions || transactions.length === 0) {
      return { analytics: {} };
    }

    // Group by category
    const categoryTotals: Record<string, number> = {};
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(t => {
      // Category totals
      if (t.type === 'expense') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }

      // Monthly data
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      monthlyData[month][t.type] += t.amount;
    });

    return {
      analytics: {
        categoryTotals,
        monthlyData,
        totalTransactions: transactions.length,
      },
    };
  },

  async predictSpending() {
    const userId = await getUserId();

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .order('date', { ascending: false })
      .limit(60);

    if (!transactions || transactions.length < 7) {
      return { predictions: [] };
    }

    // Simple moving average prediction
    const last7Days = transactions.slice(0, 7);
    const avgDaily = last7Days.reduce((sum, t) => sum + t.amount, 0) / 7;

    const predictions = [];
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predicted_amount: avgDaily * (0.9 + Math.random() * 0.2), // Add some variance
      });
    }

    return { predictions };
  },
};

// CSV Import API
export const importAPI = {
  async importCSV(csvData: string) {
    const userId = await getUserId();

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const transactions = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Auto-categorize based on merchant/description
      const description = (row.description || row.merchant || '').toLowerCase();
      let category = 'other';

      if (description.includes('grocery') || description.includes('supermarket')) {
        category = 'groceries';
      } else if (description.includes('restaurant') || description.includes('food')) {
        category = 'food';
      } else if (description.includes('gas') || description.includes('fuel')) {
        category = 'transport';
      } else if (description.includes('amazon') || description.includes('shop')) {
        category = 'shopping';
      } else if (description.includes('netflix') || description.includes('spotify')) {
        category = 'entertainment';
      }

      transactions.push({
        user_id: userId,
        merchant: row.merchant || row.description || 'Unknown',
        amount: parseFloat(row.amount || row.debit || row.withdrawal || 0),
        category,
        date: row.date || new Date().toISOString(),
        type: parseFloat(row.amount || row.debit || 0) > 0 ? 'expense' : 'income',
        payment_mode: row.payment_mode || 'bank',
        risk_score: 0,
        status: 'normal',
      });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (error) throw error;

    return {
      message: `Successfully imported ${transactions.length} transactions`,
      transactions: data,
    };
  },
};
