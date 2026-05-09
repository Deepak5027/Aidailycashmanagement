import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-be23ac86`;

export const seedDemoData = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || publicAnonKey;

    const response = await fetch(`${API_BASE}/seed-demo-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to seed demo data');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Seed error:', error);
    throw error;
  }
};
