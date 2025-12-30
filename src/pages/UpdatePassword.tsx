import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Auth.css'

export function UpdatePassword() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const { updatePassword } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        const { error } = await updatePassword(password)

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setMessage('Password updated successfully! Redirecting...')
            setTimeout(() => {
                navigate('/dashboard')
            }, 2000)
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
                        <span className="logo-icon">🔒</span>
                        <h1>ZimPay</h1>
                    </div>
                    <p className="auth-subtitle">
                        Create a new password for your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={6}
                                autoComplete="new-password"
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

                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-ghost btn-block"
                        onClick={() => navigate('/dashboard')}
                        style={{ marginTop: '10px' }}
                    >
                        Skip
                    </button>
                </form>
            </div>
        </div>
    )
}
