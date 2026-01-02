import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/supabase'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, metadata: { full_name: string; username: string; phone_number: string }) => Promise<{ error: Error | null }>
    signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
    updateProfile: (updates: { full_name?: string; phone_number?: string }) => Promise<{ error: Error | null }>
    resetPassword: (email: string) => Promise<{ error: Error | null }>
    updatePassword: (password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId: string): Promise<Profile | null> => {
        // Retry logic with exponential backoff for mobile networks
        const maxRetries = 3
        const baseDelay = 1000

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()

                if (error) {
                    // If profile fetch fails, try to create one for new users
                    const { data: { user: authUser } } = await supabase.auth.getUser()

                    if (authUser) {
                        const metadata = authUser.user_metadata

                        const newProfile = {
                            id: userId,
                            email: authUser.email,
                            full_name: metadata?.full_name || 'New User',
                            username: metadata?.username || `user_${userId.slice(0, 8)}`,
                            phone_number: metadata?.phone_number || '',
                            balance: 1000.00,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }

                        const { data: createdProfile, error: createError } = await supabase
                            .from('profiles')
                            .insert(newProfile)
                            .select()
                            .single()

                        if (createError) {
                            return null
                        }

                        return createdProfile as Profile
                    }

                    return null
                }

                return data as Profile
            } catch {
                // If not the last attempt, wait before retrying
                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt)
                    await new Promise(resolve => setTimeout(resolve, delay))
                }
            }
        }

        return null
    }

    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id)
            setProfile(profileData)
        }
    }

    useEffect(() => {
        let mounted = true

        // Set a max timeout for loading state (8 seconds for mobile compatibility)
        const loadingTimeout = setTimeout(() => {
            if (mounted && loading) {
                setLoading(false)
            }
        }, 8000)

        // Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

                if (!mounted) return

                if (sessionError) {
                    if (mounted) setLoading(false)
                    return
                }

                if (currentSession?.user) {
                    setSession(currentSession)
                    setUser(currentSession.user)
                    // Fetch profile in background, don't block
                    fetchProfile(currentSession.user.id).then(profileData => {
                        if (mounted) {
                            setProfile(profileData)
                        }
                    })
                }

                // Always set loading to false after checking session
                if (mounted) setLoading(false)
            } catch {
                if (mounted) setLoading(false)
            }
        }

        initializeAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return

            setSession(newSession)
            setUser(newSession?.user ?? null)

            if (newSession?.user) {
                // Fetch profile in background
                fetchProfile(newSession.user.id).then(profileData => {
                    if (mounted) {
                        setProfile(profileData)
                    }
                })
            } else {
                setProfile(null)
            }

            setLoading(false)
        })

        return () => {
            mounted = false
            clearTimeout(loadingTimeout)
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (
        email: string,
        password: string,
        metadata: { full_name: string; username: string; phone_number: string }
    ) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: `${window.location.origin}${window.location.pathname}#/email-verified`
                }
            })
            return { error: error as Error | null }
        } catch (err) {
            return { error: err as Error }
        }
    }

    const signIn = async (email: string, password: string, _rememberMe: boolean = true) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            return { error: error as Error | null }
        } catch (err) {
            return { error: err as Error }
        }
    }

    const updateProfile = async (updates: { full_name?: string; phone_number?: string }) => {
        if (!user) return { error: new Error('No user logged in') }

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (!error) {
                await refreshProfile()
            }

            return { error: error as Error | null }
        } catch (err) {
            return { error: err as Error }
        }
    }

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}${window.location.pathname}#/update-password`,
            })
            return { error: error as Error | null }
        } catch (err) {
            return { error: err as Error }
        }
    }

    const updatePassword = async (password: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password })
            return { error: error as Error | null }
        } catch (err) {
            return { error: err as Error }
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch {
            // Silent fail on sign out errors
        }
        // Optimistic clear
        setUser(null)
        setProfile(null)
        setSession(null)
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            signUp,
            signIn,
            signOut,
            refreshProfile,
            updateProfile,
            resetPassword,
            updatePassword
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
