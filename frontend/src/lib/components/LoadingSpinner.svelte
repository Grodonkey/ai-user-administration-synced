<script>
	import { t } from '$lib/stores/language';

	export let size = 'md';
	export let showText = true;
	export let text = null;

	const sizes = {
		sm: 'h-6 w-6 border-2',
		md: 'h-8 w-8 border-4',
		lg: 'h-12 w-12 border-4'
	};
</script>

<div class="flex flex-col items-center justify-center">
	<div
		class="animate-spin rounded-full border-gray-300 dark:border-gray-600 border-t-[#06E481] {sizes[size] || sizes.md}"
	></div>
	{#if showText}
		<p class="mt-4 text-gray-600 dark:text-gray-400">{text || $t('common.loading')}</p>
	{/if}
</div>
