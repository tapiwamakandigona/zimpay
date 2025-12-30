import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import './Auth.css'

// Country codes for phone normalization
const COUNTRY_CODES: { [key: string]: string } = {
    '263': 'ZW', // Zimbabwe
    '27': 'ZA',  // South Africa
    '254': 'KE', // Kenya
    '234': 'NG', // Nigeria
    '44': 'UK',  // United Kingdom
    '1': 'US',   // USA/Canada
    '91': 'IN',  // India
    '61': 'AU',  // Australia
}

// Normalize phone number to a standard format for comparison
const normalizePhone = (phone: string): string[] => {
    // Remove all non-digit characters except leading +
    let cleaned = phone.replace(/[^\d+]/g, '')

    // If starts with +, remove it and keep the rest
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1)
    }

    // If starts with 00 (international prefix), remove it
    if (cleaned.startsWith('00')) {
        cleaned = cleaned.substring(2)
    }

    // Generate all possible formats to check
    const formats: string[] = []

    // If starts with 0 (local format), generate international variants
    if (cleaned.startsWith('0')) {
        const localNumber = cleaned.substring(1) // Remove leading 0

        // Add common country code variants
        formats.push(`263${localNumber}`)  // Zimbabwe
        formats.push(`27${localNumber}`)   // South Africa
        formats.push(`254${localNumber}`)  // Kenya
        formats.push(`234${localNumber}`)  // Nigeria
        formats.push(`44${localNumber}`)   // UK
        formats.push(`1${localNumber}`)    // US
        formats.push(`91${localNumber}`)   // India
        formats.push(cleaned)              // Original with 0
        formats.push(localNumber)          // Without leading 0
    } else {
        // Already international format
        formats.push(cleaned)

        // Also check with leading 0 (local format)
        // Try to detect country code and add local variant
        for (const code of Object.keys(COUNTRY_CODES)) {
            if (cleaned.startsWith(code)) {
                const localPart = cleaned.substring(code.length)
                formats.push(`0${localPart}`)
                break
            }
        }
    }

    // Also add + prefixed versions
    const withPlus = formats.map(f => `+${f}`)

    return [...new Set([...formats, ...withPlus])] // Remove duplicates
}

// Get the preferred storage format (international with country code)
const getStorageFormat = (phone: string): string => {
    let cleaned = phone.replace(/[^\d]/g, '')

    // If starts with 0, default to Zimbabwe (+263)
    if (cleaned.startsWith('0')) {
        cleaned = '263' + cleaned.substring(1)
    }

    return cleaned
}

type ValidationStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export function SignUp() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        username: '',
        phoneNumber: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Real-time validation states
    const [usernameStatus, setUsernameStatus] = useState<ValidationStatus>('idle')
    const [phoneStatus, setPhoneStatus] = useState<ValidationStatus>('idle')
    const [emailStatus, setEmailStatus] = useState<ValidationStatus>('idle')

    const { signUp } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    // Debounced username check
    useEffect(() => {
        if (formData.username.length < 3) {
            setUsernameStatus('idle')
            return
        }

        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            setUsernameStatus('invalid')
            return
        }

        setUsernameStatus('checking')
        const timer = setTimeout(async () => {
            const { data } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', formData.username.toLowerCase())
                .maybeSingle()

            setUsernameStatus(data ? 'taken' : 'available')
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.username])

    // Debounced phone check
    useEffect(() => {
        const cleanPhone = formData.phoneNumber.replace(/\s/g, '')
        if (cleanPhone.length < 10) {
            setPhoneStatus('idle')
            return
        }

        setPhoneStatus('checking')
        const timer = setTimeout(async () => {
            // Get all possible phone formats to check
            const phoneFormats = normalizePhone(cleanPhone)

            // Check if any format exists in the database
            const { data } = await supabase
                .from('profiles')
                .select('phone_number')
                .in('phone_number', phoneFormats)
                .maybeSingle()

            setPhoneStatus(data ? 'taken' : 'available')
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.phoneNumber])

    // Debounced email check
    useEffect(() => {
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setEmailStatus('idle')
            return
        }

        setEmailStatus('checking')
        const timer = setTimeout(async () => {
            const { data } = await supabase
                .from('profiles')
                .select('email')
                .eq('email', formData.email.toLowerCase())
                .maybeSingle()

            setEmailStatus(data ? 'taken' : 'available')
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.email])

    // Helper to render validation indicator
    const renderValidationIcon = useCallback((status: ValidationStatus) => {
        switch (status) {
            case 'checking':
                return <span className="validation-icon checking">⏳</span>
            case 'available':
                return <span className="validation-icon available">✓</span>
            case 'taken':
                return <span className="validation-icon taken">✗</span>
            case 'invalid':
                return <span className="validation-icon invalid">⚠</span>
            default:
                return null
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters')
            return
        }

        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            setError('Username can only contain letters, numbers, and underscores')
            return
        }

        if (!/^\+?[\d\s-]{10,}$/.test(formData.phoneNumber)) {
            setError('Please enter a valid phone number (10+ digits)')
            return
        }

        setLoading(true)

        // Check for duplicate username
        const { data: existingUsername } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', formData.username.toLowerCase())
            .maybeSingle()

        if (existingUsername) {
            setError('This username is already taken. Please choose another.')
            setLoading(false)
            return
        }

        // Check for duplicate phone number (check all normalized formats)
        const cleanPhone = formData.phoneNumber.replace(/\s/g, '')
        const phoneFormats = normalizePhone(cleanPhone)
        const { data: existingPhone } = await supabase
            .from('profiles')
            .select('phone_number')
            .in('phone_number', phoneFormats)
            .maybeSingle()

        if (existingPhone) {
            setError('This phone number is already registered.')
            setLoading(false)
            return
        }

        // Store phone in normalized international format
        const normalizedPhone = getStorageFormat(cleanPhone)

        const { error } = await signUp(formData.email, formData.password, {
            full_name: formData.fullName,
            username: formData.username.toLowerCase(),
            phone_number: normalizedPhone
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Navigate to success page
            navigate('/signup-success')
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card signup-card animate-fadeInUp">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className="auth-header">
                    <div className="logo">
                        <span className="logo-icon">💳</span>
                        <h1>ZimPay</h1>
                    </div>
                    <p className="auth-subtitle">
                        Create your account and get <strong>$1,000</strong> to start!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username {renderValidationIcon(usernameStatus)}</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                required
                                autoComplete="username"
                                className={usernameStatus === 'taken' ? 'input-error' : usernameStatus === 'available' ? 'input-success' : ''}
                            />
                            {usernameStatus === 'taken' && <small className="field-error">Username already taken</small>}
                            {usernameStatus === 'invalid' && <small className="field-error">Letters, numbers, underscores only</small>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address {renderValidationIcon(emailStatus)}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            autoComplete="email"
                            className={emailStatus === 'taken' ? 'input-error' : emailStatus === 'available' ? 'input-success' : ''}
                        />
                        {emailStatus === 'taken' && <small className="field-error">Email already registered</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number {renderValidationIcon(phoneStatus)}</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="+263 77 123 4567"
                            required
                            autoComplete="tel"
                            className={phoneStatus === 'taken' ? 'input-error' : phoneStatus === 'available' ? 'input-success' : ''}
                        />
                        {phoneStatus === 'taken' && <small className="field-error">Phone number already registered</small>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
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
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                Creating Account...
                            </>
                        ) : (
                            'Create Free Account'
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>

                <p className="brand-footer">
                    Designed & Built by <a href="https://tapiwamakandigona.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Tapiwa Makandigona</a>
                </p>
            </div >
        </div >
    )
}
