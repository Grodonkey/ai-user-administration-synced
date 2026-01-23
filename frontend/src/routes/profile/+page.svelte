<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getCurrentUser, updateProfile, setup2FA, verify2FA, disable2FA, isAuthenticated, listMyProjects } from '$lib/api';
	import { t } from '$lib/stores/language';

	let user = null;
	let loading = true;
	let error = '';
	let success = '';

	let fullName = '';
	let newPassword = '';
	let confirmPassword = '';

	let twoFactorSecret = '';
	let twoFactorQRCode = '';
	let twoFactorVerifyCode = '';
	let show2FASetup = false;

	let projects = [];
	let projectsLoading = true;

	onMount(async () => {
		if (!isAuthenticated()) {
			goto('/login');
			return;
		}

		try {
			user = await getCurrentUser();
			fullName = user.full_name || '';
		} catch (err) {
			error = err.message;
			goto('/login');
		} finally {
			loading = false;
		}

		// Load user's projects
		try {
			projects = await listMyProjects();
		} catch (err) {
			console.log('Could not load projects:', err.message);
		} finally {
			projectsLoading = false;
		}
	});

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

	async function handleUpdateProfile() {
		error = '';
		success = '';

		if (newPassword && newPassword !== confirmPassword) {
			error = $t('register.passwordMismatch');
			return;
		}

		try {
			const updateData = { full_name: fullName };
			if (newPassword) {
				updateData.password = newPassword;
			}

			user = await updateProfile(updateData);
			success = $t('profile.saved');
			newPassword = '';
			confirmPassword = '';
		} catch (err) {
			error = err.message;
		}
	}

	async function handleSetup2FA() {
		error = '';
		try {
			const response = await setup2FA();
			twoFactorSecret = response.secret;
			twoFactorQRCode = response.qr_code_url;
			show2FASetup = true;
		} catch (err) {
			error = err.message;
		}
	}

	async function handleVerify2FA() {
		error = '';
		success = '';
		try {
			await verify2FA(twoFactorVerifyCode);
			success = $t('profile.2faActivated');
			show2FASetup = false;
			user.two_factor_enabled = true;
			twoFactorVerifyCode = '';
		} catch (err) {
			error = err.message;
		}
	}

	async function handleDisable2FA() {
		error = '';
		success = '';
		try {
			await disable2FA(twoFactorVerifyCode);
			success = $t('profile.2faDeactivated');
			user.two_factor_enabled = false;
			twoFactorVerifyCode = '';
		} catch (err) {
			error = err.message;
		}
	}
</script>

{#if loading}
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<p class="text-center text-gray-600 dark:text-gray-400">{$t('common.loading')}</p>
	</div>
{:else if user}
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-8">{$t('profile.title')}</h1>

		{#if error}
			<div class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-4">
				{success}
			</div>
		{/if}

		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">{$t('profile.accountInfo')}</h2>
			<div class="space-y-3">
				<div>
					<span class="font-medium text-gray-700 dark:text-gray-300">{$t('profile.email')}:</span>
					<span class="text-gray-600 dark:text-gray-400 ml-2">{user.email}</span>
				</div>
				<div>
					<span class="font-medium text-gray-700 dark:text-gray-300">{$t('profile.status')}:</span>
					{#if user.is_active}
						<span class="ml-2 inline-block bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 px-2 py-1 rounded text-sm"
							>{$t('profile.active')}</span
						>
					{:else}
						<span class="ml-2 inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 px-2 py-1 rounded text-sm"
							>{$t('profile.inactive')}</span
						>
					{/if}
				</div>
				<div>
					<span class="font-medium text-gray-700 dark:text-gray-300">{$t('profile.role')}:</span>
					{#if user.is_admin}
						<span class="ml-2 inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 px-2 py-1 rounded text-sm"
							>{$t('profile.admin')}</span
						>
					{:else}
						<span class="ml-2 inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm"
							>{$t('profile.user')}</span
						>
					{/if}
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">{$t('profile.editProfile')}</h2>

			<form on:submit|preventDefault={handleUpdateProfile}>
				<div class="mb-4">
					<label for="fullName" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{$t('profile.fullName')}</label>
					<input
						type="text"
						id="fullName"
						bind:value={fullName}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
					/>
				</div>

				<div class="mb-4">
					<label for="newPassword" class="block text-gray-700 dark:text-gray-300 font-medium mb-2"
						>{$t('profile.newPassword')}</label
					>
					<input
						type="password"
						id="newPassword"
						bind:value={newPassword}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
					/>
				</div>

				{#if newPassword}
					<div class="mb-6">
						<label for="confirmPassword" class="block text-gray-700 dark:text-gray-300 font-medium mb-2"
							>{$t('register.confirmPassword')}</label
						>
						<input
							type="password"
							id="confirmPassword"
							bind:value={confirmPassword}
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						/>
					</div>
				{/if}

				<button
					type="submit"
					class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
				>
					{$t('profile.updateProfile')}
				</button>
			</form>
		</div>

		<!-- My Projects Section -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold text-gray-800 dark:text-white">{$t('project.myProjects')}</h2>
				<a
					href="/projects/new"
					class="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
				>
					<svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					{$t('project.create')}
				</a>
			</div>

			{#if projectsLoading}
				<p class="text-gray-600 dark:text-gray-400">{$t('common.loading')}</p>
			{:else if projects.length === 0}
				<div class="text-center py-8">
					<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
					<p class="mt-4 text-gray-600 dark:text-gray-400">{$t('project.noProjects')}</p>
					<p class="text-sm text-gray-500 dark:text-gray-500">{$t('project.startFirst')}</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each projects as project}
						<a
							href="/projects/{project.slug}"
							class="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<div class="flex justify-between items-start">
								<div>
									<h3 class="font-medium text-gray-900 dark:text-white">{project.title}</h3>
									{#if project.short_description}
										<p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{project.short_description}</p>
									{/if}
								</div>
								<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getStatusColor(project.status)}">
									{$t(`project.status.${project.status}`)}
								</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">{$t('profile.2fa')}</h2>

			{#if user.two_factor_enabled}
				<div class="mb-4">
					<p class="text-green-600 dark:text-green-400 mb-4">{$t('profile.2faEnabled')}</p>
					<div class="mb-4">
						<label for="disableCode" class="block text-gray-700 dark:text-gray-300 font-medium mb-2"
							>{$t('profile.enterDisableCode')}</label
						>
						<input
							type="text"
							id="disableCode"
							bind:value={twoFactorVerifyCode}
							placeholder="123456"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						/>
					</div>
					<button
						on:click={handleDisable2FA}
						class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
					>
						{$t('profile.disable2fa')}
					</button>
				</div>
			{:else}
				{#if !show2FASetup}
					<p class="text-gray-600 dark:text-gray-400 mb-4">{$t('profile.2faDisabled')}</p>
					<button
						on:click={handleSetup2FA}
						class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
					>
						{$t('profile.2faSetup')}
					</button>
				{:else}
					<div class="space-y-4">
						<p class="text-gray-700 dark:text-gray-300">{$t('profile.scanQRCode')}</p>
						{#if twoFactorQRCode}
							<img src={twoFactorQRCode} alt="QR Code" class="mx-auto" />
						{/if}
						<p class="text-sm text-gray-600 dark:text-gray-400">{$t('profile.manualCode')}</p>
						<p class="font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded">{twoFactorSecret}</p>

						<div class="mb-4">
							<label for="verifyCode" class="block text-gray-700 dark:text-gray-300 font-medium mb-2"
								>{$t('profile.enterVerifyCode')}</label
							>
							<input
								type="text"
								id="verifyCode"
								bind:value={twoFactorVerifyCode}
								placeholder="123456"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
							/>
						</div>

						<button
							on:click={handleVerify2FA}
							class="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
						>
							{$t('profile.enable2fa')}
						</button>
						<button
							on:click={() => (show2FASetup = false)}
							class="ml-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
						>
							{$t('common.cancel')}
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}
