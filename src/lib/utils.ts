/**
 * Utility hooks for common patterns
 */

import { useRef, useCallback, useEffect } from 'react'

/**
 * Creates a debounced version of a callback function
 * Useful for search inputs, API calls, etc.
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function that cancels previous calls
 * 
 * @example
 * const debouncedSearch = useDebounce((query: string) => {
 *   searchAPI(query)
 * }, 500)
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number = 300
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const callbackRef = useRef(callback)

    // Keep callback ref updated
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args)
        }, delay)
    }, [delay])
}

/**
 * Formats a number as USD currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount)
}

/**
 * Formats a number from cents to dollars display
 * Use this when storing amounts as integers (cents)
 */
export function centsToDisplay(cents: number): string {
    return formatCurrency(cents / 100)
}

/**
 * Converts a dollar amount to cents (for storage)
 */
export function dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100)
}

/**
 * Formats a relative date string (e.g., "2m ago", "3d ago")
 */
export function formatRelativeDate(dateString: string): string {
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
