// Country data with flag image URLs from flagcdn.com
export const COUNTRIES = [
    { code: 'ZW', name: 'Zimbabwe', dial: '+263' },
    { code: 'ZA', name: 'South Africa', dial: '+27' },
    { code: 'US', name: 'United States', dial: '+1' },
    { code: 'GB', name: 'United Kingdom', dial: '+44' },
    { code: 'AU', name: 'Australia', dial: '+61' },
    { code: 'CA', name: 'Canada', dial: '+1' },
    { code: 'NG', name: 'Nigeria', dial: '+234' },
    { code: 'GH', name: 'Ghana', dial: '+233' },
    { code: 'KE', name: 'Kenya', dial: '+254' },
    { code: 'TZ', name: 'Tanzania', dial: '+255' },
    { code: 'BW', name: 'Botswana', dial: '+267' },
    { code: 'MW', name: 'Malawi', dial: '+265' },
    { code: 'ZM', name: 'Zambia', dial: '+260' },
    { code: 'MZ', name: 'Mozambique', dial: '+258' },
    { code: 'IN', name: 'India', dial: '+91' },
    { code: 'CN', name: 'China', dial: '+86' },
    { code: 'DE', name: 'Germany', dial: '+49' },
    { code: 'FR', name: 'France', dial: '+33' },
    { code: 'AE', name: 'UAE', dial: '+971' },
    { code: 'JP', name: 'Japan', dial: '+81' },
    { code: 'KR', name: 'South Korea', dial: '+82' },
    { code: 'BR', name: 'Brazil', dial: '+55' },
    { code: 'RU', name: 'Russia', dial: '+7' },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
    { code: 'SG', name: 'Singapore', dial: '+65' }
] as const

export type CountryCode = typeof COUNTRIES[number]['code']

// Helper to get flag image URL from flagcdn.com
export function getFlagUrl(code: string, size: number = 24): string {
    return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`
}
