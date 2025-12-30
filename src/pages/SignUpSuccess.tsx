import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './Auth.css'

export function SignUpSuccess() {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="auth-container">
            <div className="auth-card animate-scaleIn">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className="auth-header">
                    <div className="email-animation">
                        <span className="email-icon">📧</span>
                        <div className="email-pulse"></div>
                    </div>

                    <h1>Check Your Email</h1>
                    <p className="auth-subtitle">
                        We've sent a verification link to your email address.
                        <br />
                        Click the link to activate your account.
                    </p>
                </div>

                <div className="email-steps">
                    <div className="step">
                        <span className="step-number">1</span>
                        <span>Open your email inbox</span>
                    </div>
                    <div className="step">
                        <span className="step-number">2</span>
                        <span>Find the email from ZimPay</span>
                    </div>
                    <div className="step">
                        <span className="step-number">3</span>
                        <span>Click the verification link</span>
                    </div>
                </div>

                <div className="email-tips">
                    <p className="tip-title">Didn't receive the email?</p>
                    <ul>
                        <li>Check your spam or junk folder</li>
                        <li>Make sure you entered the correct email</li>
                        <li>Wait a few minutes and refresh</li>
                    </ul>
                </div>

                <div className="auth-actions">
                    <Link to="/login" className="btn btn-outline btn-block">
                        Back to Login
                    </Link>
                </div>

                <p className="brand-footer">
                    Designed & Built by <a href="https://tapiwamakandigona.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Tapiwa Makandigona</a>
                </p>
            </div>
        </div>
    )
}
