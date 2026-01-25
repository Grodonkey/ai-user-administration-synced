<script>
	import { t } from '$lib/stores/language';
	import { getStatusColor, getProjectTypeColor, getProjectTypeColorLight } from '$lib/utils';

	export let type = 'status';
	export let value = '';
	export let variant = 'default';

	$: badgeClass = (() => {
		if (type === 'status') {
			return getStatusColor(value);
		} else if (type === 'projectType') {
			return variant === 'light' ? getProjectTypeColorLight(value) : getProjectTypeColor(value);
		} else if (type === 'role') {
			switch (value) {
				case 'admin':
					return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400';
				case 'serialStarter':
					return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400';
				default:
					return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
			}
		}
		return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
	})();

	$: labelKey = (() => {
		if (type === 'status') {
			return `project.status.${value}`;
		} else if (type === 'projectType') {
			return `project.type.${value || 'crowdfunding'}`;
		} else if (type === 'role') {
			return `badge.${value}`;
		}
		return '';
	})();
</script>

<span class="text-xs px-2 py-1 rounded-full font-medium {badgeClass}">
	{#if $$slots.default}
		<slot />
	{:else}
		{$t(labelKey)}
	{/if}
</span>
