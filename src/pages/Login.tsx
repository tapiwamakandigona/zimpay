import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Auth.css'

export function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [rememberMe, setRememberMe] = useState(true)
    const [view, setView] = useState<'login' | 'forgot'>('login')
    const [message, setMessage] = useState('')

    const { signIn, resetPassword } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        if (view === 'login') {
            const { error } = await signIn(email, password, rememberMe)
            if (error) {
                setError(error.message)
                setLoading(false)
            } else {
                navigate('/dashboard')
            }
        } else {
            const { error } = await resetPassword(email)
            if (error) {
                setError(error.message)
            } else {
                setMessage('Password reset link sent! Check your email.')
            }
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card animate-fadeInUp">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className="auth-header">
                    <div className="logo">
                        <span className="logo-icon">💳</span>
                        <h1>ZimPay</h1>
                    </div>
                    <p className="auth-subtitle">
                        {view === 'login'
                            ? 'Welcome back! Sign in to manage your finances'
                            : 'Enter your email to reset your password'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    {view === 'login' && (
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="form-options" style={{ justifyContent: 'space-between' }}>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="checkbox-custom"></span>
                                Keep me signed in
                            </label>
                            <button
                                type="button"
                                className="btn-link"
                                onClick={() => { setView('forgot'); setError(''); setMessage('') }}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                {view === 'login' ? 'Signing in...' : 'Sending...'}
                            </>
                        ) : (
                            view === 'login' ? 'Sign In' : 'Send Reset Link'
                        )}
                    </button>

                    {view === 'forgot' && (
                        <button
                            type="button"
                            className="btn btn-ghost btn-block"
                            onClick={() => { setView('login'); setError(''); setMessage('') }}
                            style={{ marginTop: '10px' }}
                        >
                            Back to Login
                        </button>
                    )}
                </form>

                {view === 'login' && (
                    <p className="auth-footer">
                        Don't have an account? <Link to="/signup">Create one free</Link>
                    </p>
                )}

                <p className="brand-footer">
                    Designed & Built by <a href="https://tapiwamakandigona.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Tapiwa Makandigona</a>
                </p>
            </div>
        </div>
    )
}
