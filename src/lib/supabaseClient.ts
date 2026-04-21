import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'am-dashboard-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false, // Changed to false to prevent URL-based session detection
    flowType: 'pkce', // Use PKCE flow for better session handling
    debug: true, // Set to true temporarily if you need to debug auth issues

  },
  global: {
    headers: {
      'X-Client-Info': 'am-dashboard'
    }
  },
  // Add realtime configuration to prevent unnecessary connections
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Separate Supabase client for password reset that enables session detection from URL
// This is needed because Supabase redirects with token in hash, and we need to detect it
export const supabaseForPasswordReset = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'am-dashboard-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true, // Enable for password reset to detect token from URL hash
    flowType: 'pkce',
    debug: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'am-dashboard'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
