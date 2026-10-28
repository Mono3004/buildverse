import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined) ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://vmqqhhxpyeqnzzeoyhvo.supabase.co";

const supabaseAnonKey =
  (import.meta.env ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY : undefined) ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_D04FEhyv6jRnBUBs7VGn_Q_D87Wh6dD";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
