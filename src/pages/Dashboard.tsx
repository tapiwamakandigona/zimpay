import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import type { Transaction, Profile } from '../lib/supabase'
import { SendMoney } from '../components/SendMoney'
import './Dashboard.css'

export function Dashboard() {
    const { user, profile, signOut, refreshProfile, updateProfile, resetPassword } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [showSendMoney, setShowSendMoney] = useState(false)
    const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home')

    // Profile Edit States
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' })
    const [isResetting, setIsResetting] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        fetchTransactions()

        // Subscribe to real-time updates
        const subscription = supabase
            .channel('transactions')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'transactions' },
                () => {
                    fetchTransactions()
                    refreshProfile()
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user, navigate])

    const fetchTransactions = async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        sender:profiles!transactions_sender_id_fkey(id, full_name, username),
        receiver:profiles!transactions_receiver_id_fkey(id, full_name, username)
      `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) {
            console.error('Error fetching transactions:', error)
        } else {
            setTransactions(data || [])
        }
        setLoading(false)
    }

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    const getTransactionType = (tx: Transaction) => {
        return tx.sender_id === user?.id ? 'sent' : 'received'
    }

    const handleStartEdit = () => {
        if (profile) {
            setEditName(profile.full_name)
            setEditPhone(profile.phone_number)
            setIsEditing(true)
            setUpdateMessage({ type: '', text: '' })
        }
    }

    const handleUpdateProfile = async () => {
        setUpdateMessage({ type: '', text: '' })
        const { error } = await updateProfile({ full_name: editName, phone_number: editPhone })

        if (error) {
            setUpdateMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        } else {
            setUpdateMessage({ type: 'success', text: 'Profile updated successfully' })
            setIsEditing(false)
        }
    }

    const handleResetPassword = async () => {
        if (profile?.email) {
            setIsResetting(true)
            const { error } = await resetPassword(profile.email)

            if (error) {
                setUpdateMessage({ type: 'error', text: error.message || 'Failed to send reset email' })
            } else {
                setUpdateMessage({ type: 'success', text: 'Password reset email sent to ' + profile.email })
            }
            setIsResetting(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">💳</div>
                    <div className="spinner"></div>
                    <p className="loading-text">Preparing your dashboard...</p>
                </div>
            </div>
        )
    }

    // Show loading while profile is being fetched
    if (!profile) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">💳</div>
                    <div className="spinner"></div>
                    <p className="loading-text">Fetching your account...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-mini">
                        <span>💳</span>
                        <span className="logo-text">ZimPay</span>
                    </div>
                </div>
                <div className="header-right">
                    <button className="btn-icon theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="btn-icon signout-btn" onClick={handleSignOut} aria-label="Sign out">
                        🚪
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                {activeTab === 'home' && (
                    <>
                        {/* Balance Card */}
                        <section className="balance-section animate-fadeInUp">
                            <div className="balance-card glass-card">
                                <div className="balance-header">
                                    <span className="balance-label">Available Balance</span>
                                    <span className="balance-badge">USD</span>
                                </div>
                                <h1 className="balance-amount">{formatCurrency(profile.balance)}</h1>
                                <div className="balance-footer">
                                    <div className="balance-user">
                                        <span className="user-avatar">{profile.full_name.charAt(0)}</span>
                                        <span className="user-name">@{profile.username}</span>
                                    </div>
                                    <div className="card-chip">💳</div>
                                </div>
                                <div className="card-decoration"></div>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section className="quick-actions animate-fadeInUp stagger-1">
                            <button className="action-btn primary" onClick={() => setShowSendMoney(true)}>
                                <span className="action-icon">💸</span>
                                <span>Send Money</span>
                            </button>
                            <button className="action-btn secondary" onClick={() => setActiveTab('history')}>
                                <span className="action-icon">📊</span>
                                <span>History</span>
                            </button>
                            <button className="action-btn secondary" onClick={() => setActiveTab('profile')}>
                                <span className="action-icon">👤</span>
                                <span>Profile</span>
                            </button>
                        </section>

                        {/* Recent Transactions */}
                        <section className="transactions-section animate-fadeInUp stagger-2">
                            <div className="section-header">
                                <h2>Recent Activity</h2>
                                {transactions.length > 0 && (
                                    <button className="btn-ghost" onClick={() => setActiveTab('history')}>
                                        View all
                                    </button>
                                )}
                            </div>

                            {transactions.length === 0 ? (
                                <div className="empty-state card">
                                    <span className="empty-icon">📭</span>
                                    <h3>No transactions yet</h3>
                                    <p>Send money to someone to get started!</p>
                                    <button className="btn btn-primary" onClick={() => setShowSendMoney(true)}>
                                        Send Your First Payment
                                    </button>
                                </div>
                            ) : (
                                <div className="transactions-list">
                                    {transactions.slice(0, 5).map((tx, index) => {
                                        const type = getTransactionType(tx)
                                        const otherUser = type === 'sent'
                                            ? (tx.receiver as unknown as Profile)
                                            : (tx.sender as unknown as Profile)

                                        return (
                                            <div
                                                key={tx.id}
                                                className={`transaction-item card`}
                                                style={{ animationDelay: `${index * 0.05}s` }}
                                            >
                                                <div className={`tx-icon ${type}`}>
                                                    {type === 'sent' ? '↗' : '↙'}
                                                </div>
                                                <div className="tx-details">
                                                    <p className="tx-name">
                                                        {type === 'sent' ? 'Sent to ' : 'From '}
                                                        <strong>{otherUser?.full_name || 'Unknown'}</strong>
                                                    </p>
                                                    <p className="tx-meta">
                                                        <span className="tx-username">@{otherUser?.username}</span>
                                                        <span className="tx-date">{formatDate(tx.created_at)}</span>
                                                    </p>
                                                </div>
                                                <div className={`tx-amount ${type}`}>
                                                    {type === 'sent' ? '-' : '+'}{formatCurrency(tx.amount)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {activeTab === 'history' && (
                    <section className="history-section animate-fadeIn">
                        <div className="section-header">
                            <button className="back-btn" onClick={() => setActiveTab('home')}>
                                ← Back
                            </button>
                            <h2>Transaction History</h2>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="empty-state card">
                                <span className="empty-icon">📭</span>
                                <h3>No transactions yet</h3>
                                <p>Your transaction history will appear here</p>
                            </div>
                        ) : (
                            <div className="transactions-list">
                                {transactions.map((tx, index) => {
                                    const type = getTransactionType(tx)
                                    const otherUser = type === 'sent'
                                        ? (tx.receiver as unknown as Profile)
                                        : (tx.sender as unknown as Profile)

                                    return (
                                        <div
                                            key={tx.id}
                                            className={`transaction-item card`}
                                            style={{ animationDelay: `${index * 0.03}s` }}
                                        >
                                            <div className={`tx-icon ${type}`}>
                                                {type === 'sent' ? '↗' : '↙'}
                                            </div>
                                            <div className="tx-details">
                                                <p className="tx-name">
                                                    {type === 'sent' ? 'Sent to ' : 'From '}
                                                    <strong>{otherUser?.full_name || 'Unknown'}</strong>
                                                </p>
                                                <p className="tx-meta">
                                                    <span className="tx-username">@{otherUser?.username}</span>
                                                    <span className="tx-date">{formatDate(tx.created_at)}</span>
                                                </p>
                                                {tx.description && (
                                                    <p className="tx-note">"{tx.description}"</p>
                                                )}
                                            </div>
                                            <div className={`tx-amount ${type}`}>
                                                {type === 'sent' ? '-' : '+'}{formatCurrency(tx.amount)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'profile' && (
                    <section className="profile-section animate-fadeIn">
                        <button className="back-btn" onClick={() => setActiveTab('home')}>
                            ← Back to Home
                        </button>
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {profile.full_name.charAt(0)}
                            </div>
                            <h2>{isEditing ? 'Edit Profile' : profile.full_name}</h2>
                            <p className="profile-username">@{profile.username}</p>
                        </div>

                        {updateMessage.text && (
                            <div className={`alert alert-${updateMessage.type}`} style={{
                                padding: '12px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                background: updateMessage.type === 'error' ? 'var(--danger-bg)' : 'var(--success-bg)',
                                color: updateMessage.type === 'error' ? 'var(--danger)' : 'var(--success)',
                                textAlign: 'center'
                            }}>
                                {updateMessage.text}
                            </div>
                        )}

                        <div className="profile-info card">
                            {isEditing ? (
                                <>
                                    <div className="info-row">
                                        <label className="info-label" htmlFor="edit-name">Full Name</label>
                                        <input
                                            id="edit-name"
                                            type="text"
                                            className="edit-input"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={{
                                                textAlign: 'right',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '8px',
                                                padding: '8px',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                    <div className="info-row">
                                        <label className="info-label" htmlFor="edit-phone">Phone</label>
                                        <input
                                            id="edit-phone"
                                            type="tel"
                                            className="edit-input"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            style={{
                                                textAlign: 'right',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '8px',
                                                padding: '8px',
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                    <div className="info-row" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '16px' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
                                        <button className="btn btn-primary btn-sm" onClick={handleUpdateProfile}>Save Changes</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="info-row">
                                        <span className="info-label">📧 Email</span>
                                        <span className="info-value">{profile.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">📱 Phone</span>
                                        <span className="info-value">{profile.phone_number}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">👤 Username</span>
                                        <span className="info-value">@{profile.username}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">💰 Balance</span>
                                        <span className="info-value balance">{formatCurrency(profile.balance)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="profile-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button className="btn btn-secondary btn-block" onClick={handleStartEdit}>
                                    ✏️ Edit Profile
                                </button>
                                <button className="btn btn-warning btn-block" onClick={handleResetPassword} disabled={isResetting}>
                                    {isResetting ? 'Sending...' : '🔒 Reset Password'}
                                </button>
                                <button className="btn btn-danger btn-block" onClick={handleSignOut}>
                                    Sign Out
                                </button>
                            </div>
                        )}

                        <div className="about-dev card" style={{ marginTop: '24px' }}>
                            <h3>About ZimPay</h3>
                            <p>A banking simulation app demonstrating modern web development with React, TypeScript, and Supabase.</p>
                            <p className="dev-credit">
                                Designed & Built by <a href="https://tapiwamakandigona.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Tapiwa Makandigona</a>
                            </p>
                        </div>
                    </section>
                )}
            </main>

            {/* Send Money Modal */}
            {showSendMoney && (
                <SendMoney
                    onClose={() => setShowSendMoney(false)}
                    onSuccess={() => {
                        setShowSendMoney(false)
                        fetchTransactions()
                        refreshProfile()
                    }}
                />
            )}
        </div>
    )
}
