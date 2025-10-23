// Returns the browser's locale (e.g., 'en-US') or a fallback if not available
export function getBrowserLocale(fallback = 'en-US'): string {
    if (typeof window !== 'undefined' && window.navigator) {
        return window.navigator.language || fallback;
    }
    return fallback;
}
// Format a date string according to the user's browser locale
export function formatDateByLocale(date: string | Date): string {
    // Always use a fixed locale and format for SSR/CSR consistency
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    // Example: 23/10/2025 (day/month/year)
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
