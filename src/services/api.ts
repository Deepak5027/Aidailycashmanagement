import { projectId } from '../../utils/supabase/info';
import { authService } from './auth';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-be23ac86`;

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const authState = authService.getState();
  const token = authState.accessToken;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// Transactions API
export const transactionsAPI = {
  getAll: () => apiRequest('/transactions'),
  create: (transaction: any) => apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  }),
  update: (id: string, updates: any) => apiRequest(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/transactions/${id}`, {
    method: 'DELETE',
  }),
};

// Budgets API
export const budgetsAPI = {
  getAll: () => apiRequest('/budgets'),
  create: (budget: any) => apiRequest('/budgets', {
    method: 'POST',
    body: JSON.stringify(budget),
  }),
  update: (id: string, updates: any) => apiRequest(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/budgets/${id}`, {
    method: 'DELETE',
  }),
};

// Goals API
export const goalsAPI = {
  getAll: () => apiRequest('/goals'),
  create: (goal: any) => apiRequest('/goals', {
    method: 'POST',
    body: JSON.stringify(goal),
  }),
  update: (id: string, updates: any) => apiRequest(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/goals/${id}`, {
    method: 'DELETE',
  }),
};

// Investments API
export const investmentsAPI = {
  getAll: () => apiRequest('/investments'),
  create: (investment: any) => apiRequest('/investments', {
    method: 'POST',
    body: JSON.stringify(investment),
  }),
  update: (id: string, updates: any) => apiRequest(`/investments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/investments/${id}`, {
    method: 'DELETE',
  }),
};

// Bills API
export const billsAPI = {
  getAll: () => apiRequest('/bills'),
  create: (bill: any) => apiRequest('/bills', {
    method: 'POST',
    body: JSON.stringify(bill),
  }),
  delete: (id: string) => apiRequest(`/bills/${id}`, {
    method: 'DELETE',
  }),
};

// Receipts API
export const receiptsAPI = {
  getAll: () => apiRequest('/receipts'),
  save: (receipt: any) => apiRequest('/receipts', {
    method: 'POST',
    body: JSON.stringify(receipt),
  }),
};

// AI & Analytics API
export const aiAPI = {
  getInsights: () => apiRequest('/insights'),
  analyzeFraud: (transaction: any) => apiRequest('/analyze-fraud', {
    method: 'POST',
    body: JSON.stringify({ transaction }),
  }),
  getAnalytics: () => apiRequest('/analytics'),
  predictSpending: () => apiRequest('/predict-spending'),
};

// CSV Import API
export const importAPI = {
  importCSV: (csvData: string) => apiRequest('/import-csv', {
    method: 'POST',
    body: JSON.stringify({ csvData }),
  }),
};
