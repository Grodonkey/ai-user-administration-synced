<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/stores/language';
	import { auth } from '$lib/stores/auth';
	import { suggestSlug, createProject } from '$lib/api';

	let title = '';
	let slug = '';
	let slugEdited = false;
	let shortDescription = '';
	let description = '';
	let fundingGoal = '';
	let imageUrl = '';
	let videoUrl = '';

	let loading = false;
	let error = null;
	let slugLoading = false;

	onMount(() => {
		if (!$auth.isAuthenticated) {
			goto('/login?redirect=/projects/new');
		}
	});

	let debounceTimer;
	async function handleTitleChange() {
		if (slugEdited) return;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			if (title.trim()) {
				slugLoading = true;
				try {
					const result = await suggestSlug(title);
					if (!slugEdited) {
						slug = result.slug;
					}
				} catch (e) {
					console.error('Failed to suggest slug:', e);
				} finally {
					slugLoading = false;
				}
			}
		}, 300);
	}

	function handleSlugEdit() {
		slugEdited = true;
	}

	async function handleSubmit() {
		error = null;

		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		if (!slug.trim()) {
			error = 'Slug is required';
			return;
		}

		loading = true;

		try {
			const projectData = {
				title: title.trim(),
				slug: slug.trim(),
				short_description: shortDescription.trim() || null,
				description: description.trim() || null,
				funding_goal: fundingGoal ? parseFloat(fundingGoal) : null,
				image_url: imageUrl.trim() || null,
				video_url: videoUrl.trim() || null
			};

			const project = await createProject(projectData);
			goto(`/projects/${project.slug}`);
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="mb-8">
		<a href="/" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
			<svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			{$t('project.back')}
		</a>
	</div>

	<div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
			{$t('project.create')}
		</h1>

		{#if error}
			<div class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Title -->
			<div>
				<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$t('project.title')} *
				</label>
				<input
					type="text"
					id="title"
					bind:value={title}
					on:input={handleTitleChange}
					placeholder={$t('project.titlePlaceholder')}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
					required
				/>
			</div>

			<!-- Slug -->
			<div>
				<label for="slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$t('project.slug')} *
				</label>
				<div class="relative">
					<input
						type="text"
						id="slug"
						bind:value={slug}
						on:input={handleSlugEdit}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						required
					/>
					{#if slugLoading}
						<div class="absolute right-3 top-1/2 -translate-y-1/2">
							<div class="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
						</div>
					{/if}
				</div>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
					{$t('project.slugHint')}
				</p>
			</div>

			<!-- Short Description -->
			<div>
				<label for="shortDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$t('project.shortDescription')}
				</label>
				<textarea
					id="shortDescription"
					bind:value={shortDescription}
					rows="2"
					maxlength="500"
					placeholder={$t('project.shortDescriptionPlaceholder')}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				></textarea>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
					{shortDescription.length}/500
				</p>
			</div>

			<!-- Description -->
			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$t('project.description')}
				</label>
				<textarea
					id="description"
					bind:value={description}
					rows="6"
					placeholder={$t('project.descriptionPlaceholder')}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				></textarea>
			</div>

			<!-- Funding Goal -->
			<div>
				<label for="fundingGoal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$t('project.fundingGoal')} (EUR)
				</label>
				<input
					type="number"
					id="fundingGoal"
					bind:value={fundingGoal}
					min="0"
					step="1"
					placeholder={$t('project.fundingGoalPlaceholder')}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<!-- Image URL -->
			<div>
				<label for="imageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$t('project.imageUrl')}
				</label>
				<input
					type="url"
					id="imageUrl"
					bind:value={imageUrl}
					placeholder="https://..."
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<!-- Video URL -->
			<div>
				<label for="videoUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{$t('project.videoUrl')}
				</label>
				<input
					type="url"
					id="videoUrl"
					bind:value={videoUrl}
					placeholder="https://..."
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<!-- Submit Button -->
			<div class="pt-4">
				<button
					type="submit"
					disabled={loading}
					class="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{loading ? $t('project.creating') : $t('project.create')}
				</button>
			</div>
		</form>
	</div>
</div>
