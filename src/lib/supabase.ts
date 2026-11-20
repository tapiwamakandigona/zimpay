import { createClient } from '@supabase/supabase-js'

// Load Supabase configuration from environment variables with public client fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ilhwoebtxxkudihfgmub.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaHdvZWJ0eHhrdWRpaGZnbXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDQ3ODIsImV4cCI6MjA4MjYyMDc4Mn0.gHgoACn3MS-Y2Yy4I_cdh5sKuuV7hRikyVmm6OfP8zM'

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
