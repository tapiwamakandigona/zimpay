import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getAllPhoneFormats } from '../lib/phoneUtils'
import type { Profile } from '../lib/supabase'
import './SendMoney.css'

interface SendMoneyProps {
    onClose: () => void
    onSuccess: () => void
}

export function SendMoney({ onClose, onSuccess }: SendMoneyProps) {
    const { user, profile } = useAuth()

    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [recipientProfile, setRecipientProfile] = useState<Profile | null>(null)
    const [isZimBetRecipient, setIsZimBetRecipient] = useState(false)

    const handleSearch = async () => {
        // ========== INPUT VALIDATION ==========
        const rawInput = recipient.trim()

        if (!rawInput) {
            setError('Please enter a username, email, or phone number')
            return
        }

        // Check minimum length
        if (rawInput.length < 2) {
            setError('Please enter at least 2 characters')
            return
        }

        setLoading(true)
        setError('')
        setRecipientProfile(null)
        setIsZimBetRecipient(false)

        // ========== INPUT CLASSIFICATION ==========
        // Remove @ prefix for processing
        const searchTerm = rawInput.replace(/^@+/, '').trim()

        // Check if user is sending to a ZimBet username (zm-*)
        const isZimBetUsername = searchTerm.toLowerCase().startsWith('zm-')

        if (isZimBetUsername) {
            // Search in zimbet_accounts table
            try {
                const { data: zimbetAccount, error: zimbetError } = await supabase
                    .from('zimbet_accounts')
                    .select('id, user_id, username, balance')
                    .eq('username', searchTerm.toLowerCase())
                    .single()

                if (zimbetError || !zimbetAccount) {
                    setError(`ZimBet account "@${searchTerm}" not found. Check the username.`)
                    setLoading(false)
                    return
                }

                // Create a Profile-like object for the UI
                setRecipientProfile({
                    id: zimbetAccount.user_id,
                    email: '',
                    full_name: 'ZimBet Account',
                    username: zimbetAccount.username,
                    phone_number: '',
                    balance: zimbetAccount.balance,
                    created_at: '',
                    updated_at: ''
                })
                setIsZimBetRecipient(true)
                setError('')
                setLoading(false)
                return
            } catch {
                setError('Error looking up ZimBet account. Try again.')
                setLoading(false)
                return
            }
        }

        // Detect input type
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchTerm)
        const isPhoneNumber = /^[\d\s+\-()]+$/.test(searchTerm) && searchTerm.replace(/\D/g, '').length >= 9
        const isUsername = !isEmail && !isPhoneNumber

        // Validate username format if it's a username
        if (isUsername) {
            // Remove any remaining special chars except underscore
            const cleanUsername = searchTerm.toLowerCase().replace(/[^a-z0-9_]/g, '')
            if (cleanUsername.length < 2) {
                setError('Username must be at least 2 characters (letters, numbers, underscore only)')
                setLoading(false)
                return
            }
            if (cleanUsername !== searchTerm.toLowerCase()) {
                // Has special characters - warn user
                setError(`Invalid characters in username. Did you mean "@${cleanUsername}"?`)
                setLoading(false)
                return
            }
        }

        // ========== SEARCH WITH TIMEOUT ==========
        const TIMEOUT_MS = 10000
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
        })

        try {
            let data = null
            let searchMethod = ''

            if (isEmail) {
                // ===== SEARCH BY EMAIL =====
                searchMethod = 'email'
                const result = await Promise.race([
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('email', searchTerm.toLowerCase())
                        .maybeSingle(),
                    timeoutPromise
                ])
                data = result.data
                if (result.error) throw new Error('DB_ERROR')

            } else if (isPhoneNumber) {
                // ===== SEARCH BY PHONE =====
                searchMethod = 'phone'
                const phoneFormats = getAllPhoneFormats(searchTerm)

                const result = await Promise.race([
                    supabase
                        .from('profiles')
                        .select('*')
                        .in('phone_number', phoneFormats)
                        .limit(1)
                        .maybeSingle(),
                    timeoutPromise
                ])
                data = result.data
                if (result.error) throw new Error('DB_ERROR')

            } else {
                // ===== SEARCH BY USERNAME =====
                searchMethod = 'username'
                const username = searchTerm.toLowerCase()

                // Try exact match first
                const result = await Promise.race([
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('username', username)
                        .maybeSingle(),
                    timeoutPromise
                ])
                data = result.data
                if (result.error) throw new Error('DB_ERROR')

                // If no exact match, try case-insensitive partial match as hint
                if (!data) {
                    const partialResult = await Promise.race([
                        supabase
                            .from('profiles')
                            .select('username')
                            .ilike('username', `%${username}%`)
                            .limit(3),
                        timeoutPromise
                    ])

                    if (partialResult.data && partialResult.data.length > 0) {
                        const suggestions = partialResult.data.map(p => `@${p.username}`).join(', ')
                        setError(`User "@${username}" not found. Did you mean: ${suggestions}?`)
                        setLoading(false)
                        return
                    }
                }
            }

            // ========== RESULT HANDLING ==========
            if (!data) {
                // Specific error messages based on search type
                if (searchMethod === 'email') {
                    setError('No account found with this email address.')
                } else if (searchMethod === 'phone') {
                    setError('No account found with this phone number. Try different format (e.g., 0773123456).')
                } else {
                    setError(`User "@${searchTerm}" not found. Check the spelling.`)
                }
                setRecipientProfile(null)
            } else if (data.id === user?.id) {
                setError('You cannot send money to yourself')
                setRecipientProfile(null)
            } else {
                setRecipientProfile(data as Profile)
                setError('')
            }
        } catch (err) {
            // ========== ERROR HANDLING ==========
            if (err instanceof Error) {
                if (err.message === 'TIMEOUT') {
                    setError('Search timed out. Please check your connection and try again.')
                } else if (err.message === 'DB_ERROR') {
                    setError('Database error. Please try again later.')
                } else {
                    setError('Something went wrong. Please try again.')
                }
            } else {
                setError('Unexpected error. Please try again.')
            }
            setRecipientProfile(null)
        }

        setLoading(false)
    }

    const handleContinue = () => {
        const amountNum = parseFloat(amount)

        if (!recipientProfile) {
            setError('Please find a valid recipient first')
            return
        }

        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount')
            return
        }

        if (amountNum > (profile?.balance || 0)) {
            setError('Insufficient balance')
            return
        }

        if (amountNum < 1) {
            setError('Minimum transfer amount is $1')
            return
        }

        setError('')
        setStep('confirm')
    }

    const handleConfirm = async () => {
        if (!user || !recipientProfile || !profile) return

        setLoading(true)
        setError('')

        const transferAmount = Math.floor(parseFloat(amount))

        // Handle ZimBet recipient differently
        if (isZimBetRecipient) {
            try {
                // 1. Deduct from sender's ZimPay balance
                const { error: deductError } = await supabase
                    .from('profiles')
                    .update({ balance: Math.floor(profile.balance - transferAmount) })
                    .eq('id', user.id)

                if (deductError) {
                    setError('Failed to process transfer. Try again.')
                    setLoading(false)
                    return
                }

                // 2. Add to ZimBet account balance
                const { error: addError } = await supabase
                    .from('zimbet_accounts')
                    .update({ balance: Math.floor(recipientProfile.balance + transferAmount) })
                    .eq('username', recipientProfile.username)

                if (addError) {
                    // Rollback
                    await supabase
                        .from('profiles')
                        .update({ balance: profile.balance })
                        .eq('id', user.id)
                    setError('Transfer failed. Balance restored.')
                    setLoading(false)
                    return
                }

                // 3. Record transaction
                await supabase
                    .from('transactions')
                    .insert({
                        sender_id: user.id,
                        receiver_id: recipientProfile.id,
                        amount: transferAmount,
                        description: description || `Transfer to ZimBet @${recipientProfile.username}`,
                        status: 'completed'
                    })

                setStep('success')
                setLoading(false)
                return
            } catch {
                setError('Something went wrong. Try again.')
                setLoading(false)
                return
            }
        }

        // Regular ZimPay to ZimPay transfer
        const { data, error: transferError } = await supabase
            .rpc('transfer_money', {
                p_sender_id: user.id,
                p_receiver_identifier: recipientProfile.username,
                p_amount: transferAmount,
                p_description: description || null
            })

        if (transferError) {
            setError(transferError.message)
            setLoading(false)
            return
        }

        const result = data as { success: boolean; error?: string }

        if (!result.success) {
            setError(result.error || 'Transfer failed')
            setLoading(false)
            return
        }

        setStep('success')
        setLoading(false)
    }

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(num)
    }

    const handleClose = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                    className="modal-close"
                    onClick={handleClose}
                    type="button"
                    aria-label="Close modal"
                >
                    ✕
                </button>

                {step === 'form' && (
                    <>
                        <div className="modal-header">
                            <span className="modal-icon">💸</span>
                            <h2>Send Money</h2>
                            <p>Transfer funds instantly to any ZimPay user</p>
                        </div>

                        <div className="modal-body">
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label>Recipient Username or Phone</label>
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={(e) => {
                                            setRecipient(e.target.value)
                                            setRecipientProfile(null)
                                        }}
                                        placeholder="@username or 0773..."
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-search"
                                        onClick={handleSearch}
                                        disabled={loading}
                                    >
                                        {loading ? '...' : '🔍'}
                                    </button>
                                </div>
                            </div>

                            {recipientProfile && (
                                <div className="recipient-card">
                                    <div className="recipient-avatar">
                                        {recipientProfile.full_name.charAt(0)}
                                    </div>
                                    <div className="recipient-info">
                                        <p className="recipient-name">{recipientProfile.full_name}</p>
                                        <p className="recipient-username">@{recipientProfile.username}</p>
                                    </div>
                                    <span className="recipient-check">✓</span>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Amount (USD)</label>
                                <div className="amount-input">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="1"
                                        max={profile?.balance}
                                        step="0.01"
                                    />
                                </div>
                                <p className="balance-hint">
                                    Available: {formatCurrency(profile?.balance || 0)}
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Note (optional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What's this for?"
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-block"
                                onClick={handleContinue}
                                disabled={!recipientProfile || !amount}
                            >
                                Continue
                            </button>
                        </div>
                    </>
                )}

                {step === 'confirm' && recipientProfile && (
                    <>
                        <div className="modal-header">
                            <span className="modal-icon">🔒</span>
                            <h2>Confirm Transfer</h2>
                            <p>Review the details before sending</p>
                        </div>

                        <div className="modal-body">
                            {error && <div className="error-message">{error}</div>}

                            <div className="confirm-details">
                                <div className="confirm-row">
                                    <span>To</span>
                                    <span className="confirm-value">{recipientProfile.full_name}</span>
                                </div>
                                <div className="confirm-row">
                                    <span>Username</span>
                                    <span className="confirm-value">@{recipientProfile.username}</span>
                                </div>
                                <div className="confirm-row-amount">
                                    <span>Amount</span>
                                    <span className="confirm-amount">{formatCurrency(parseFloat(amount))}</span>
                                </div>
                                {description && (
                                    <div className="confirm-row">
                                        <span>Note</span>
                                        <span className="confirm-value">{description}</span>
                                    </div>
                                )}
                            </div>

                            <div className="confirm-buttons">
                                <button
                                    className="btn btn-outline btn-block"
                                    onClick={() => setStep('form')}
                                >
                                    Back
                                </button>
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Confirm & Send'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {step === 'success' && recipientProfile && (
                    <>
                        <div className="modal-header success-header">
                            <span className="success-icon">✅</span>
                            <h2>Transfer Successful!</h2>
                            <p>Your money is on its way</p>
                        </div>

                        <div className="modal-body">
                            <div className="success-details">
                                <p className="success-amount">{formatCurrency(parseFloat(amount))}</p>
                                <p className="success-to">sent to <strong>{recipientProfile.full_name}</strong></p>
                            </div>

                            <button className="btn btn-primary btn-block" onClick={onSuccess}>
                                Done
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
