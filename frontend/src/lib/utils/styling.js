/**
 * Styling utilities for the application
 * Returns Tailwind CSS classes for consistent styling across components
 */

/**
 * Get status badge color classes
 * @param {string} status - Project status
 * @returns {string} Tailwind CSS classes
 */
export function getStatusColor(status) {
	switch (status) {
		case 'draft':
			return 'bg-gray-100 dark:bg-gray-700 text-[#304b50] dark:text-gray-300';
		case 'submitted':
			return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
		case 'verified':
			return 'bg-[#06E481]/20 dark:bg-[#06E481]/20 text-[#304b50] dark:text-[#06E481]';
		case 'financing':
			return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
		case 'ended_success':
			return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400';
		case 'ended_failed':
			return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
		case 'rejected':
			return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
		default:
			return 'bg-gray-100 dark:bg-gray-700 text-[#304b50] dark:text-gray-300';
	}
}

/**
 * Get project type badge color classes (20% opacity, standard)
 * @param {string} type - Project type (crowdfunding, fundraising, private)
 * @returns {string} Tailwind CSS classes
 */
export function getProjectTypeColor(type) {
	switch (type) {
		case 'crowdfunding':
			return 'bg-[#06E481]/20 text-[#304b50] dark:text-[#06E481]';
		case 'fundraising':
			return 'bg-[#FF85FF]/20 text-[#FF85FF]';
		case 'private':
			return 'bg-[#FFC21C]/20 text-[#FFC21C]';
		default:
			return 'bg-gray-100 dark:bg-gray-700 text-[#304b50] dark:text-gray-300';
	}
}

/**
 * Get project type badge color classes (30% opacity, for discover/feed pages)
 * @param {string} type - Project type (crowdfunding, fundraising, private)
 * @returns {string} Tailwind CSS classes
 */
export function getProjectTypeColorLight(type) {
	switch (type) {
		case 'crowdfunding':
			return 'bg-[#06E481]/30 text-[#06E481]';
		case 'fundraising':
			return 'bg-[#FF85FF]/30 text-[#FF85FF]';
		case 'private':
			return 'bg-[#FFC21C]/30 text-[#FFC21C]';
		default:
			return 'bg-gray-100/30 text-white';
	}
}

/**
 * Get project type button classes (for CTA buttons)
 * @param {string} type - Project type
 * @returns {string} Tailwind CSS classes
 */
export function getProjectTypeButtonClass(type) {
	switch (type) {
		case 'crowdfunding':
			return 'bg-[#06E481] text-[#304b50] hover:bg-[#05b667]';
		case 'fundraising':
			return 'bg-[#FF85FF] text-white hover:bg-[#e070e0]';
		case 'private':
			return 'bg-[#FFC21C] text-[#304b50] hover:bg-[#e0aa18]';
		default:
			return 'bg-[#06E481] text-[#304b50] hover:bg-[#05b667]';
	}
}

/**
 * Get project type accent color (hex value)
 * @param {string} type - Project type
 * @returns {string} Hex color value
 */
export function getProjectTypeAccentColor(type) {
	switch (type) {
		case 'crowdfunding':
			return '#06E481';
		case 'fundraising':
			return '#FF85FF';
		case 'private':
			return '#FFC21C';
		default:
			return '#06E481';
	}
}

/**
 * Get sort icon for table headers
 * @param {string} column - Column name
 * @param {string} sortBy - Current sort column
 * @param {string} sortDir - Current sort direction ('asc' or 'desc')
 * @returns {string} Sort icon character
 */
export function getSortIcon(column, sortBy, sortDir) {
	if (sortBy !== column) return '↕';
	return sortDir === 'asc' ? '↑' : '↓';
}
