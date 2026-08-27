import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bidqcfqicbcyktncqpno.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZHFjZnFpY2JjeWt0bmNxcG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjY4NzcsImV4cCI6MjEwMjIwMjg3N30.6xbC0BE_9m77pvw0NPgtnjQsIM-6gHkfj-B5C0Si2N8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
