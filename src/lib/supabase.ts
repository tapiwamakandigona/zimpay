import { createClient } from '@supabase/supabase-js'

// Load Supabase configuration from environment variables
// These are injected by Vite at build time from .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use localStorage consistently - sessionStorage caused issues on mobile
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Increase timeout for mobile connections
    storageKey: 'zimpay-auth',
    flowType: 'pkce'
  }
})

// Types for our database - using 'export type' for proper ESM handling
export type Profile = {
  id: string
  email: string
  full_name: string
  username: string
  phone_number: string
  balance: number
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  sender_id: string
  receiver_id: string
  amount: number
  description: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  // Joined data
  sender?: Profile
  receiver?: Profile
}
