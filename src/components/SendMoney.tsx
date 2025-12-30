import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
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

    const handleSearch = async () => {
        if (!recipient.trim()) {
            setError('Please enter a username or phone number')
            return
        }

        setLoading(true)
        setError('')

        const { data, error: searchError } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.eq.${recipient.toLowerCase()},phone_number.eq.${recipient}`)
            .single()

        if (searchError || !data) {
            setError('Recipient not found. Check the username or phone number.')
            setRecipientProfile(null)
        } else if (data.id === user?.id) {
            setError('You cannot send money to yourself')
            setRecipientProfile(null)
        } else {
            setRecipientProfile(data as Profile)
            setError('')
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
        if (!user || !recipientProfile) return

        setLoading(true)
        setError('')

        const { data, error: transferError } = await supabase
            .rpc('transfer_money', {
                p_sender_id: user.id,
                p_receiver_identifier: recipientProfile.username,
                p_amount: parseFloat(amount),
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

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
                                        placeholder="@username or +263..."
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
