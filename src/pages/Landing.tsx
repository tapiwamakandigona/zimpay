import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './Landing.css'

export function Landing() {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="landing">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <span className="logo-icon">💳</span>
                        <span className="logo-text">ZimPay</span>
                    </div>
                    <div className="nav-actions">
                        <button className="btn-icon theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <Link to="/login" className="btn btn-ghost">Login</Link>
                        <Link to="/signup" className="btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge animate-fadeInDown">
                        <span>🚀</span> Banking Made Simple
                    </div>
                    <h1 className="hero-title animate-fadeInUp">
                        Send Money <span className="gradient-text">Instantly</span>
                        <br />Anywhere, Anytime
                    </h1>
                    <p className="hero-subtitle animate-fadeInUp stagger-1">
                        Experience the future of digital banking. Transfer funds securely to anyone
                        using just their username or phone number.
                    </p>
                    <div className="hero-cta animate-fadeInUp stagger-2">
                        <Link to="/signup" className="btn btn-primary btn-lg">
                            Create Free Account
                            <span className="cta-arrow">→</span>
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Sign In
                        </Link>
                    </div>
                    <div className="hero-stats animate-fadeInUp stagger-3">
                        <div className="stat">
                            <span className="stat-value">$1,000</span>
                            <span className="stat-label">Starting Balance</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-value">Instant</span>
                            <span className="stat-label">Transfers</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-value">100%</span>
                            <span className="stat-label">Secure</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual animate-scaleIn">
                    <div className="phone-mockup">
                        <div className="phone-screen">
                            <div className="mockup-header">
                                <span>💳 ZimPay</span>
                            </div>
                            <div className="mockup-balance">
                                <span className="mockup-label">Balance</span>
                                <span className="mockup-amount">$1,000.00</span>
                            </div>
                            <div className="mockup-actions">
                                <div className="mockup-btn">💸 Send</div>
                                <div className="mockup-btn">📊 History</div>
                            </div>
                            <div className="mockup-transactions">
                                <div className="mockup-tx received">
                                    <span>↙ Received</span>
                                    <span>+$50.00</span>
                                </div>
                                <div className="mockup-tx sent">
                                    <span>↗ Sent</span>
                                    <span>-$25.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="floating-cards">
                        <div className="float-card card-1">💰</div>
                        <div className="float-card card-2">🔒</div>
                        <div className="float-card card-3">⚡</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="features-container">
                    <div className="section-header">
                        <span className="section-badge">Features</span>
                        <h2>Everything You Need</h2>
                        <p>Modern banking experience at your fingertips</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card glass-card animate-fadeInUp">
                            <div className="feature-icon">💸</div>
                            <h3>Instant Transfers</h3>
                            <p>Send money to anyone instantly using their username or phone number. No waiting, no delays.</p>
                        </div>
                        <div className="feature-card glass-card animate-fadeInUp stagger-1">
                            <div className="feature-icon">🔒</div>
                            <h3>Secure & Safe</h3>
                            <p>Bank-grade security with encrypted transactions. Your money and data are always protected.</p>
                        </div>
                        <div className="feature-card glass-card animate-fadeInUp stagger-2">
                            <div className="feature-icon">📱</div>
                            <h3>Mobile First</h3>
                            <p>Optimized for all devices. Manage your finances on the go from any smartphone or computer.</p>
                        </div>
                        <div className="feature-card glass-card animate-fadeInUp stagger-3">
                            <div className="feature-icon">🌙</div>
                            <h3>Dark Mode</h3>
                            <p>Easy on the eyes with beautiful light and dark themes. Switch anytime with one tap.</p>
                        </div>
                        <div className="feature-card glass-card animate-fadeInUp stagger-4">
                            <div className="feature-icon">📊</div>
                            <h3>Transaction History</h3>
                            <p>Track all your payments and receipts in one place. Always know where your money goes.</p>
                        </div>
                        <div className="feature-card glass-card animate-fadeInUp stagger-5">
                            <div className="feature-icon">⚡</div>
                            <h3>Real-time Updates</h3>
                            <p>See your balance update instantly. No need to refresh – everything syncs automatically.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="hiw-container">
                    <div className="section-header">
                        <span className="section-badge">How It Works</span>
                        <h2>Get Started in Minutes</h2>
                        <p>Three simple steps to financial freedom</p>
                    </div>
                    <div className="steps">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Create Account</h3>
                            <p>Sign up with your email, choose a username, and verify your account.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Get $1,000</h3>
                            <p>Receive your starting balance instantly – ready to use immediately.</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Start Sending</h3>
                            <p>Transfer money to friends using their username or phone number.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container glass-card">
                    <h2>Ready to Start?</h2>
                    <p>Join ZimPay today and experience modern banking</p>
                    <Link to="/signup" className="btn btn-primary btn-lg">
                        Create Your Free Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="nav-logo">
                            <span className="logo-icon">💳</span>
                            <span className="logo-text">ZimPay</span>
                        </div>
                        <p>A banking simulation demonstrating modern web development.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Quick Links</h4>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Sign Up</Link>
                        </div>
                        <div className="footer-col">
                            <h4>Developer</h4>
                            <a href="https://tapiwamakandigona.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Portfolio</a>
                            <a href="https://github.com/tapiwamakandigona" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>Designed & Built with 💙 by <a href="https://tapiwamakandigona.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Tapiwa Makandigona</a></p>
                </div>
            </footer>
        </div>
    )
}
