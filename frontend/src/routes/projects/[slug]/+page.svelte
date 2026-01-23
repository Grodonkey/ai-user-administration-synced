<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { t } from '$lib/stores/language';
	import { auth } from '$lib/stores/auth';
	import { getProject, updateProject, deleteProject, submitProject } from '$lib/api';

	let project = null;
	let loading = true;
	let error = null;
	let editing = false;
	let saving = false;
	let submitting = false;
	let deleting = false;
	let showDeleteConfirm = false;

	// Edit form data
	let editTitle = '';
	let editSlug = '';
	let editShortDescription = '';
	let editDescription = '';
	let editFundingGoal = '';
	let editImageUrl = '';
	let editVideoUrl = '';

	$: slug = $page.params.slug;
	$: isOwner = $auth.user && project && $auth.user.id === project.owner_id;
	$: canEdit = isOwner && (project?.status === 'draft' || project?.status === 'submitted');

	onMount(() => {
		loadProject();
	});

	async function loadProject() {
		loading = true;
		error = null;
		try {
			project = await getProject(slug);
			initEditForm();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function initEditForm() {
		if (project) {
			editTitle = project.title || '';
			editSlug = project.slug || '';
			editShortDescription = project.short_description || '';
			editDescription = project.description || '';
			editFundingGoal = project.funding_goal || '';
			editImageUrl = project.image_url || '';
			editVideoUrl = project.video_url || '';
		}
	}

	function startEditing() {
		initEditForm();
		editing = true;
	}

	function cancelEditing() {
		editing = false;
		initEditForm();
	}

	async function saveChanges() {
		saving = true;
		error = null;
		try {
			const updatedData = {
				title: editTitle.trim(),
				slug: editSlug.trim(),
				short_description: editShortDescription.trim() || null,
				description: editDescription.trim() || null,
				funding_goal: editFundingGoal ? parseFloat(editFundingGoal) : null,
				image_url: editImageUrl.trim() || null,
				video_url: editVideoUrl.trim() || null
			};

			project = await updateProject(project.slug, updatedData);

			// If slug changed, navigate to new URL
			if (editSlug !== slug) {
				goto(`/projects/${project.slug}`, { replaceState: true });
			}

			editing = false;
		} catch (e) {
			error = e.message;
		} finally {
			saving = false;
		}
	}

	async function handleSubmit() {
		submitting = true;
		error = null;
		try {
			project = await submitProject(project.slug);
		} catch (e) {
			error = e.message;
		} finally {
			submitting = false;
		}
	}

	async function handleDelete() {
		deleting = true;
		error = null;
		try {
			await deleteProject(project.slug);
			goto('/profile');
		} catch (e) {
			error = e.message;
			deleting = false;
		}
	}

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

	function formatDate(dateStr) {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getStatusColor(status) {
		switch (status) {
			case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
			case 'submitted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'verified': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'financing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'ended_success': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
			case 'ended_failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="mb-8">
		<a href="/" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
			<svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			{$t('project.back')}
		</a>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
			<p class="mt-4 text-gray-600 dark:text-gray-400">{$t('common.loading')}</p>
		</div>
	{:else if error && !project}
		<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
			{error}
		</div>
	{:else if project}
		{#if error}
			<div class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
				{error}
			</div>
		{/if}

		{#if editing}
			<!-- Edit Form -->
			<div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
					{$t('project.edit')}
				</h1>

				<form on:submit|preventDefault={saveChanges} class="space-y-6">
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							{$t('project.title')} *
						</label>
						<input
							type="text"
							id="title"
							bind:value={editTitle}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							required
						/>
					</div>

					<div>
						<label for="slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							{$t('project.slug')} *
						</label>
						<input
							type="text"
							id="slug"
							bind:value={editSlug}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							required
						/>
					</div>

					<div>
						<label for="shortDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							{$t('project.shortDescription')}
						</label>
						<textarea
							id="shortDescription"
							bind:value={editShortDescription}
							rows="2"
							maxlength="500"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						></textarea>
					</div>

					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							{$t('project.description')}
						</label>
						<textarea
							id="description"
							bind:value={editDescription}
							rows="6"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						></textarea>
					</div>

					<div>
						<label for="fundingGoal" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							{$t('project.fundingGoal')} (EUR)
						</label>
						<input
							type="number"
							id="fundingGoal"
							bind:value={editFundingGoal}
							min="0"
							step="1"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label for="imageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							{$t('project.imageUrl')}
						</label>
						<input
							type="url"
							id="imageUrl"
							bind:value={editImageUrl}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div>
						<label for="videoUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							{$t('project.videoUrl')}
						</label>
						<input
							type="url"
							id="videoUrl"
							bind:value={editVideoUrl}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<div class="flex gap-4 pt-4">
						<button
							type="submit"
							disabled={saving}
							class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{saving ? $t('project.saving') : $t('project.save')}
						</button>
						<button
							type="button"
							on:click={cancelEditing}
							class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
						>
							{$t('common.cancel')}
						</button>
					</div>
				</form>
			</div>
		{:else}
			<!-- Project View -->
			<div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
				<!-- Project Image -->
				{#if project.image_url}
					<img
						src={project.image_url}
						alt={project.title}
						class="w-full h-64 object-cover"
					/>
				{:else}
					<div class="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
						<svg class="h-24 w-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
						</svg>
					</div>
				{/if}

				<div class="p-6">
					<!-- Status Badge and Owner Actions -->
					<div class="flex justify-between items-start mb-4">
						<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getStatusColor(project.status)}">
							{$t(`project.status.${project.status}`)}
						</span>

						{#if isOwner}
							<div class="flex gap-2">
								{#if canEdit}
									<button
										on:click={startEditing}
										class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
									>
										{$t('project.edit')}
									</button>
								{/if}
								{#if project.status === 'draft'}
									<button
										on:click={handleSubmit}
										disabled={submitting}
										class="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 transition-colors"
									>
										{submitting ? $t('project.submitting') : $t('project.submit')}
									</button>
									<button
										on:click={() => showDeleteConfirm = true}
										class="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
									>
										{$t('project.delete')}
									</button>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Title -->
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						{project.title}
					</h1>

					<!-- Owner and Date -->
					<div class="text-gray-600 dark:text-gray-400 text-sm mb-6">
						{#if project.owner}
							{$t('project.by')} {project.owner.full_name || project.owner.email}
						{/if}
						<span class="mx-2">•</span>
						{formatDate(project.created_at)}
					</div>

					<!-- Funding Progress -->
					{#if project.funding_goal}
						<div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
							<div class="flex justify-between items-end mb-2">
								<div>
									<div class="text-2xl font-bold text-gray-900 dark:text-white">
										{formatCurrency(project.funding_current)}
									</div>
									<div class="text-sm text-gray-600 dark:text-gray-400">
										{$t('project.goal')}: {formatCurrency(project.funding_goal)}
									</div>
								</div>
								<div class="text-right">
									<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
										{calculateProgress(project.funding_current, project.funding_goal)}%
									</div>
									<div class="text-sm text-gray-600 dark:text-gray-400">
										{$t('project.funded')}
									</div>
								</div>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
								<div
									class="bg-blue-600 h-3 rounded-full transition-all"
									style="width: {calculateProgress(project.funding_current, project.funding_goal)}%"
								></div>
							</div>
						</div>
					{/if}

					<!-- Short Description -->
					{#if project.short_description}
						<p class="text-lg text-gray-700 dark:text-gray-300 mb-6">
							{project.short_description}
						</p>
					{/if}

					<!-- Full Description -->
					{#if project.description}
						<div class="prose dark:prose-invert max-w-none">
							<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
								{$t('project.description')}
							</h2>
							<div class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
								{project.description}
							</div>
						</div>
					{/if}

					<!-- Video -->
					{#if project.video_url}
						<div class="mt-6">
							<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Video</h2>
							<div class="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
								<iframe
									src={project.video_url}
									title="Project video"
									class="w-full h-full"
									frameborder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
								></iframe>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Delete Confirmation Modal -->
		{#if showDeleteConfirm}
			<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						{$t('project.delete')}
					</h3>
					<p class="text-gray-600 dark:text-gray-400 mb-6">
						{$t('project.confirmDelete')}
					</p>
					<div class="flex gap-4">
						<button
							on:click={handleDelete}
							disabled={deleting}
							class="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
						>
							{deleting ? $t('common.loading') : $t('common.delete')}
						</button>
						<button
							on:click={() => showDeleteConfirm = false}
							class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
						>
							{$t('common.cancel')}
						</button>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
