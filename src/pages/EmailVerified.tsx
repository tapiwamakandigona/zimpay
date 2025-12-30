import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './Auth.css'

export function EmailVerified() {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="auth-container">
            <div className="auth-card animate-scaleIn">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className="auth-header">
                    <div className="success-animation">
                        <div className="success-checkmark">
                            <svg viewBox="0 0 52 52" className="checkmark-svg">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="success-title">Email Verified! 🎉</h1>
                    <p className="auth-subtitle">
                        Your account is now active and ready to use.
                        <br />
                        Welcome to ZimPay!
                    </p>
                </div>

                <div className="verified-info">
                    <div className="info-item">
                        <span className="info-icon">💰</span>
                        <div>
                            <strong>$1,000 Starting Balance</strong>
                            <p>We've added funds to get you started</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">💸</span>
                        <div>
                            <strong>Instant Transfers</strong>
                            <p>Send money using username or phone</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">🔒</span>
                        <div>
                            <strong>Secure & Fast</strong>
                            <p>Your transactions are protected</p>
                        </div>
                    </div>
                </div>

                <Link to="/login" className="btn btn-primary btn-block btn-lg">
                    Continue to Login
                </Link>

                <p className="brand-footer">
                    Designed & Built by <a href="https://tapiwamakandigona.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Tapiwa Makandigona</a>
                </p>
            </div>
        </div>
    )
}
