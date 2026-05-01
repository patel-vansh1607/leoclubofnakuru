import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bdtxkmnmmnpbvzzhpcdv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkdHhrbW5tbW5wYnZ6emhwY2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjQzMzgsImV4cCI6MjA5MzE0MDMzOH0.I4SJBybqlJWu1_USa3yN4wqXo70Vr_J2qBk-wtTyXbE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);