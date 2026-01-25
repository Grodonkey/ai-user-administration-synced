<script>
	export let icon = 'box';
	export let message = '';
	export let actionText = '';
	export let actionHref = '';

	const icons = {
		box: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
		users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
		folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
		search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
	};
</script>

<div class="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
	<svg
		class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d={icons[icon] || icons.box}
		/>
	</svg>
	<p class="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
	{#if actionText && actionHref}
		<a
			href={actionHref}
			class="inline-block px-4 py-2 bg-[#06E481] text-[#304b50] font-medium rounded-lg hover:bg-[#05b667] transition-colors"
		>
			{actionText}
		</a>
	{/if}
	<slot />
</div>
