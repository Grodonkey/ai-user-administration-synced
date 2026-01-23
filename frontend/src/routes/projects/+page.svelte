<script>
	import { onMount } from 'svelte';
	import { t } from '$lib/stores/language';
	import { listProjects } from '$lib/api';

	let projects = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			projects = await listProjects(null, 0, 50);
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	});

	function formatCurrency(amount) {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount || 0);
	}

	function calculateProgress(current, goal) {
		if (!goal || goal === 0) return 0;
		return Math.min(100, Math.round((current / goal) * 100));
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="flex justify-between items-center mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
			{$t('home.featuredProjects')}
		</h1>
		<a
			href="/projects/new"
			class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
		>
			<svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			{$t('home.cta')}
		</a>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
			<p class="mt-4 text-gray-600 dark:text-gray-400">{$t('common.loading')}</p>
		</div>
	{:else if error}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
			{error}
		</div>
	{:else if projects.length === 0}
		<div class="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
			<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
			</svg>
			<p class="mt-4 text-gray-600 dark:text-gray-400">{$t('home.noProjects')}</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each projects as project}
				<a
					href="/projects/{project.slug}"
					class="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
				>
					{#if project.image_url}
						<img
							src={project.image_url}
							alt={project.title}
							class="w-full h-48 object-cover"
						/>
					{:else}
						<div class="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
							<svg class="h-16 w-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</div>
					{/if}
					<div class="p-4">
						<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							{project.title}
						</h3>
						{#if project.short_description}
							<p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
								{project.short_description}
							</p>
						{/if}
						{#if project.funding_goal}
							<div class="mb-2">
								<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
									<span>{formatCurrency(project.funding_current)}</span>
									<span>{calculateProgress(project.funding_current, project.funding_goal)}% {$t('project.funded')}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										class="bg-blue-600 h-2 rounded-full transition-all"
										style="width: {calculateProgress(project.funding_current, project.funding_goal)}%"
									></div>
								</div>
								<div class="text-sm text-gray-500 dark:text-gray-500 mt-1">
									{$t('project.goal')}: {formatCurrency(project.funding_goal)}
								</div>
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
