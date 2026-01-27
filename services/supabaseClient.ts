
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Environment variables or Hardcoded for specific environment
// Note: In production, these should be process.env vars, but we are using the provided credentials directly.
const supabaseUrl = process.env.SERVICE_SUPABASE_URL || 'https://nxzdhptspqwuzhgfsxmu.supabase.co';
const supabaseKey = process.env.SERVICE_SUPABASE_KEY || 'sb_publishable_O_LihLc-dnnJTmdSEoZNrQ_RJEf6ay7';

// Create Supabase client
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient<Database>(supabaseUrl, supabaseKey)
    : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Helper function to check if Supabase is available
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}
