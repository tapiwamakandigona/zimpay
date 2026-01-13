import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { supabase } from './lib/supabase'
import './App.css'

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })))
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })))
const SignUp = lazy(() => import('./pages/SignUp').then(module => ({ default: module.SignUp })))
const SignUpSuccess = lazy(() => import('./pages/SignUpSuccess').then(module => ({ default: module.SignUpSuccess })))
const EmailVerified = lazy(() => import('./pages/EmailVerified').then(module => ({ default: module.EmailVerified })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const UpdatePassword = lazy(() => import('./pages/UpdatePassword').then(module => ({ default: module.UpdatePassword })))

// Handle Supabase auth callbacks (email verification, password reset)
// This runs before HashRouter to process tokens in the URL hash
function useAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash

      // Check if this is a Supabase auth callback (contains access_token or type=)
      if (hash && (hash.includes('access_token') || hash.includes('type='))) {
        try {
          // Extract the hash fragment (remove the leading #)
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          const type = hashParams.get('type')

          if (accessToken && refreshToken) {
            // Set the session with the tokens
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })

            // Determine redirect based on type
            if (type === 'recovery') {
              setRedirectTo('#/update-password')
            } else if (type === 'signup' || type === 'email') {
              setRedirectTo('#/email-verified')
            } else {
              setRedirectTo('#/dashboard')
            }

            // Clean the URL by removing the hash params
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch {
          // Silent fail on auth callback errors
        }
      }

      setIsProcessing(false)
    }

    handleAuthCallback()
  }, [])

  return { isProcessing, redirectTo }
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">💳</div>
        <div className="spinner"></div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Securing your session..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Getting things ready..." />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading..." />}>
      <Routes>
        {/* Landing Page - Public */}
        <Route path="/" element={<Landing />} />

        {/* Auth Pages */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />
        <Route path="/signup-success" element={<SignUpSuccess />} />
        <Route path="/email-verified" element={<EmailVerified />} />

        {/* Protected Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/update-password" element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        } />

        {/* Catch any other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  const { isProcessing, redirectTo } = useAuthCallback()

  // If we processed an auth callback, redirect to the appropriate page
  useEffect(() => {
    if (!isProcessing && redirectTo) {
      window.location.hash = redirectTo
    }
  }, [isProcessing, redirectTo])

  // Show loading while processing auth callback
  if (isProcessing) {
    return (
      <ThemeProvider>
        <LoadingScreen message="Verifying your account..." />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
