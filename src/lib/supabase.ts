import { createClient } from "@supabase/supabase-js";

// For Figma Make: Use environment variables if available, otherwise fallback to hardcoded values
// For production deployment, use environment variables only
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zjzwrjtefacptghosbtm.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_T_AnCaPE1wSp2yxpQL-O5A_cEGUXjoc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
