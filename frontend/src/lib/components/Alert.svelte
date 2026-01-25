<script>
	export let type = 'error';
	export let message = '';
	export let dismissable = false;

	let visible = true;

	const styles = {
		error: 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-400',
		success: 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-700 dark:text-green-400',
		warning: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400',
		info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400'
	};

	function dismiss() {
		visible = false;
	}
</script>

{#if visible && message}
	<div class="border px-4 py-3 rounded mb-4 {styles[type] || styles.error}" role="alert">
		<div class="flex items-center justify-between">
			<span>{message}</span>
			{#if dismissable}
				<button
					on:click={dismiss}
					class="ml-4 text-current opacity-70 hover:opacity-100"
					aria-label="Dismiss"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
{/if}
