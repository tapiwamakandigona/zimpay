import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilhwoebtxxkudihfgmub.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaHdvZWJ0eHhrdWRpaGZnbXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNDQ3ODIsImV4cCI6MjA4MjYyMDc4Mn0.gHgoACn3MS-Y2Yy4I_cdh5sKuuV7hRikyVmm6OfP8zM'

// Detect if running on mobile device
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Use sessionStorage for mobile devices to avoid localStorage issues
// On mobile browsers, localStorage can be unreliable or cleared when the browser closes
// sessionStorage persists only within the current tab/session, which is more reliable on mobile
const storage = isMobile() ? window.sessionStorage : window.localStorage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
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
