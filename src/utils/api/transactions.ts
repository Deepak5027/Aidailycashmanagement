import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-be23ac86`;

async function getAuthToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || publicAnonKey;
}

export const transactionAPI = {
  async getAll() {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return await response.json();
  },

  async create(transaction: any) {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }

    return await response.json();
  },

  async update(id: string, updates: any) {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update transaction');
    }

    return await response.json();
  },

  async delete(id: string) {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }

    return await response.json();
  },
};

export const budgetAPI = {
  async getAll() {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/budgets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch budgets');
    }

    return await response.json();
  },

  async create(budget: any) {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(budget),
    });

    if (!response.ok) {
      throw new Error('Failed to create budget');
    }

    return await response.json();
  },
};

export const goalsAPI = {
  async getAll() {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }

    return await response.json();
  },

  async create(goal: any) {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(goal),
    });

    if (!response.ok) {
      throw new Error('Failed to create goal');
    }

    return await response.json();
  },

  async update(id: string, updates: any) {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update goal');
    }

    return await response.json();
  },
};

export const insightsAPI = {
  async get() {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}/insights`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch insights');
    }

    return await response.json();
  },
};
