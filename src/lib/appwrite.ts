import { Client, Account, Databases } from 'appwrite'

// Load Appwrite configuration from environment variables
const appwriteEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID

// Validate environment variables are present
if (!appwriteProjectId) {
  throw new Error('Missing Appwrite environment variables. Please set VITE_APPWRITE_PROJECT_ID.')
}

export const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId)

export const account = new Account(client)
export const databases = new Databases(client)

// --- MIGRATION PLACEHOLDERS ---
// You MUST replace these IDs with the actual IDs generated after you run the Appwrite Migration Tool!
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'PLACEHOLDER_DATABASE_ID'
export const PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || 'PLACEHOLDER_PROFILES_COLLECTION_ID'
export const TRANSACTIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'PLACEHOLDER_TRANSACTIONS_COLLECTION_ID'

// Types for our database 
export type Profile = {
  $id: string
  email: string
  full_name: string
  username: string
  phone_number: string
  balance: number
  created_at: string
  updated_at: string
}

export type Transaction = {
  $id: string
  sender_id: string
  receiver_id: string
  amount: number
  description: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  // Joined data (Note: Appwrite doesn't have auto-joins natively like Postgres, so we must fetch these manually or use relationship attributes)
  sender?: Profile
  receiver?: Profile
}
