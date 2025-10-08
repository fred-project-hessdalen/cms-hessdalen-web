// Returns the browser's locale (e.g., 'en-US') or a fallback if not available
export function getBrowserLocale(fallback = 'en-US'): string {
    if (typeof window !== 'undefined' && window.navigator) {
        return window.navigator.language || fallback;
    }
    return fallback;
}
// Format a date string according to the user's browser locale
export function formatDateByLocale(date: string | Date, fallbackLocale = 'en-US'): string {
    const locale = getBrowserLocale(fallbackLocale);
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    // Use Intl.DateTimeFormat for other locales
    return d.toLocaleDateString(locale);
}
