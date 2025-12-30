import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { SignUpSuccess } from './pages/SignUpSuccess'
import { EmailVerified } from './pages/EmailVerified'
import { Dashboard } from './pages/Dashboard'
import { UpdatePassword } from './pages/UpdatePassword'
import './App.css'

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
  )
}

function App() {
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
