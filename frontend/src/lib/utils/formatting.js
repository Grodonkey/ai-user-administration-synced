/**
 * Formatting utilities for the application
 */

/**
 * Format a number as currency (EUR)
 * @param {number} amount - The amount to format
 * @param {string} locale - Locale for formatting (default: 'de-DE')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, locale = 'de-DE') {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount || 0);
}

/**
 * Calculate funding progress percentage
 * @param {number} current - Current funding amount
 * @param {number} goal - Funding goal
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgress(current, goal) {
	if (!goal || goal === 0) return 0;
	return Math.min(100, Math.round((current / goal) * 100));
}

/**
 * Format a date string
 * @param {string} dateStr - Date string to format
 * @param {object} options - Formatting options
 * @param {string} options.locale - Locale (default: 'de-DE')
 * @param {boolean} options.includeDay - Include day in output (default: false)
 * @param {string} options.fallback - Fallback value if no date (default: '')
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr, options = {}) {
	const { locale = 'de-DE', includeDay = false, fallback = '' } = options;

	if (!dateStr) return fallback;

	const dateOptions = {
		year: 'numeric',
		month: 'long',
		...(includeDay && { day: 'numeric' })
	};

	return new Date(dateStr).toLocaleDateString(locale, dateOptions);
}

/**
 * Format a date string (short format, used in admin tables)
 * @param {string} dateStr - Date string to format
 * @param {string} locale - Locale (default: 'de-DE')
 * @param {string} fallback - Fallback value if no date (default: '-')
 * @returns {string} Formatted date string
 */
export function formatDateShort(dateStr, locale = 'de-DE', fallback = '-') {
	if (!dateStr) return fallback;
	return new Date(dateStr).toLocaleDateString(locale);
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name) {
	if (!name) return '?';
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

/**
 * Format project count with pluralization
 * @param {number} count - Number of projects
 * @param {function} t - Translation function
 * @returns {string} Formatted project count
 */
export function formatProjectCount(count, t) {
	const parts = t('community.projectCount').split('|');
	if (count === 1) {
		return parts[0].trim().replace('{count}', count);
	}
	return parts[1]?.trim().replace('{count}', count) || `${count} Projekte`;
}
