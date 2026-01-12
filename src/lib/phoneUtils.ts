import { parsePhoneNumber, isValidPhoneNumber as isValidLibPhone } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'

/**
 * Phone Number Utilities for ZimPay - Powered by libphonenumber-js
 * Provides "web dev on steroids" level handling for international numbers
 * with specific fixes for common Zimbabwean input errors.
 */

// Default country for parsing if no international dial code is provided
const DEFAULT_COUNTRY: CountryCode = 'ZW'

/**
 * Pre-cleans input to fix common user typos before parsing
 * E.g. fixes "263 077..." which is invalid E.164 but common locally
 */
const fixCommonTypos = (phone: string): string => {
    if (!phone) return ''

    // Remove all non-digit and non-plus chars
    const cleaned = phone.replace(/[^\d+]/g, '')

    // Fix: "263077..." -> "26377..." (Common error: Country code + Local leading zero)
    if (cleaned.startsWith('2630') && cleaned.length >= 12) {
        return '+' + '263' + cleaned.substring(4)
    }

    // Fix: "+263077..." -> "+26377..."
    if (cleaned.startsWith('+2630') && cleaned.length >= 13) {
        return '+263' + cleaned.substring(5)
    }

    // Fix: "00263..." -> "+263..." (Double zero prefix)
    if (cleaned.startsWith('00')) {
        return '+' + cleaned.substring(2)
    }

    return cleaned
}

/**
 * Parses and normalizes a phone number to E.164 format (e.g., +263773049503)
 * Handles international numbers automatically.
 * Defaults to Zimbabwe if no country code provided.
 */
export const normalizePhoneNumber = (phone: string): string => {
    try {
        const fixed = fixCommonTypos(phone)

        // If it looks like a local ZW number starting with 0, or just digits, parse with default country
        // If it starts with +, libphonenumber handles the country detection
        const phoneNumber = parsePhoneNumber(fixed, DEFAULT_COUNTRY)

        if (phoneNumber && phoneNumber.isValid()) {
            return phoneNumber.number.toString() // Returns E.164 (e.g., +263773049503)
        }
    } catch {
        // Fallback for edge cases or very broken numbers
        // console.warn('Phone normalization error:', error)
    }

    // Fallback: If strict parsing fails, do a best-effort manual cleanup for Zim numbers
    // This catches cases libphonenumber might be too strict about if the user is typing partials
    const digits = phone.replace(/[^\d]/g, '')
    if (digits.length === 9 || (digits.startsWith('0') && digits.length === 10)) {
        // Likely a local ZW number (773... or 0773...)
        return `+263${digits.replace(/^0/, '')}`
    } else if (digits.startsWith('263') && digits.length > 9) {
        // Likely 263...
        return `+${digits}`
    }

    return phone // Return original if all else fails
}

/**
 * Generates all possible lookup formats to ensure we find the user in the DB
 * regardless of how they signed up or how the number was stored previously.
 */
export const getAllPhoneFormats = (phone: string): string[] => {
    const e164 = normalizePhoneNumber(phone) // +263773049503
    if (!e164 || !e164.startsWith('+')) return [phone]

    const digitsOnly = e164.replace('+', '') // 263773049503

    // Generate variations
    const formats = new Set<string>()
    formats.add(e164)          // +263773049503 (Ideal)
    formats.add(digitsOnly)    // 263773049503 (Legacy storage)

    // If it's a Zim number, add local variations
    if (e164.startsWith('+263')) {
        const localPart = digitsOnly.substring(3) // 773049503
        formats.add(`0${localPart}`)              // 0773049503
        formats.add(localPart)                    // 773049503
        formats.add(`2630${localPart}`)           // 2630773... (Typos stored in DB?)
        formats.add(`+2630${localPart}`)
    }

    return Array.from(formats)
}

/**
 * Formats phone for pretty display
 * e.g. +263 77 304 9503 or (US) +1 213 373 4253
 */
export const formatPhoneForDisplay = (phone: string): string => {
    try {
        const fixed = fixCommonTypos(phone)
        const phoneNumber = parsePhoneNumber(fixed, DEFAULT_COUNTRY)
        if (phoneNumber) {
            return phoneNumber.formatInternational() // +263 77 304 9503
        }
    } catch {
        // Ignore
    }
    return phone
}

/**
 * Validates if the phone number is a possible valid number
 */
export const isValidPhone = (phone: string): boolean => {
    try {
        const fixed = fixCommonTypos(phone)
        return isValidLibPhone(fixed, DEFAULT_COUNTRY)
    } catch {
        return false
    }
}

/**
 * Helper to check equality
 */
export const phonesAreEqual = (phone1: string, phone2: string): boolean => {
    return normalizePhoneNumber(phone1) === normalizePhoneNumber(phone2)
}
