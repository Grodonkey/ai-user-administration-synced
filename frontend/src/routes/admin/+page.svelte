<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Redirect to projects page by default
		goto('/admin/projects', { replaceState: true });
	});
</script>

<div class="text-center py-12">
	<p class="text-gray-600 dark:text-gray-400">Redirecting...</p>
</div>
