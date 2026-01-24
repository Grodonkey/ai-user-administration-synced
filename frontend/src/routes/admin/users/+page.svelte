<script>
	import { onMount } from 'svelte';
	import { listUsers, updateUser, deleteUser } from '$lib/api';
	import { t, language } from '$lib/stores/language';

	let users = [];
	let loading = true;
	let error = '';
	let success = '';

	onMount(async () => {
		await loadUsers();
	});

	async function loadUsers() {
		loading = true;
		error = '';
		try {
			users = await listUsers();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function toggleActive(userId, currentStatus) {
		error = '';
		success = '';
		try {
			await updateUser(userId, { is_active: !currentStatus });
			success = $t('admin.userStatusUpdated');
			await loadUsers();
		} catch (err) {
			error = err.message;
		}
	}

	async function toggleAdmin(userId, currentStatus) {
		error = '';
		success = '';
		try {
			await updateUser(userId, { is_admin: !currentStatus });
			success = $t('admin.adminStatusUpdated');
			await loadUsers();
		} catch (err) {
			error = err.message;
		}
	}

	async function handleDeleteUser(userId, email) {
		const confirmMsg = $t('admin.confirmDeleteUser').replace('{email}', email);
		if (!confirm(confirmMsg)) {
			return;
		}

		error = '';
		success = '';
		try {
			await deleteUser(userId);
			success = $t('admin.userDeleted');
			await loadUsers();
		} catch (err) {
			error = err.message;
		}
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString($language === 'de' ? 'de-DE' : 'en-US');
	}
</script>

<div>
	<h1 class="text-3xl font-bold text-[#304b50] dark:text-white mb-8">{$t('admin.userManagement')}</h1>

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

	{#if loading}
		<div class="text-center py-12">
			<p class="text-gray-600 dark:text-gray-400">{$t('common.loading')}</p>
		</div>
	{:else}
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead class="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								{$t('admin.email')}
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								{$t('admin.name')}
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								{$t('admin.status')}
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								{$t('admin.role')}
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								{$t('admin.2fa')}
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								{$t('admin.created')}
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
							>
								{$t('admin.actions')}
							</th>
						</tr>
					</thead>
					<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{#each users as user}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-[#304b50] dark:text-gray-100">
									{user.email}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-[#304b50] dark:text-gray-100">
									{user.full_name || '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if user.is_active}
										<span class="inline-block bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 px-2 py-1 rounded text-xs"
											>{$t('admin.active')}</span
										>
									{:else}
										<span class="inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 px-2 py-1 rounded text-xs"
											>{$t('admin.inactive')}</span
										>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if user.is_admin}
										<span class="inline-block bg-[#06E481]/20 dark:bg-[#06E481]/20 text-[#304b50] dark:text-[#06E481] px-2 py-1 rounded text-xs"
											>{$t('admin.admin')}</span
										>
									{:else}
										<span class="inline-block bg-gray-100 dark:bg-gray-700 text-[#304b50] dark:text-gray-300 px-2 py-1 rounded text-xs"
											>{$t('admin.user')}</span
										>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-[#304b50] dark:text-gray-100">
									{user.two_factor_enabled ? '✓' : '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
									{formatDate(user.created_at)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
									<button
										on:click={() => toggleActive(user.id, user.is_active)}
										class="text-[#304b50] dark:text-[#06E481] hover:text-[#1d2d30] dark:hover:text-[#33f79f]"
									>
										{user.is_active ? $t('admin.deactivate') : $t('admin.activate')}
									</button>
									<button
										on:click={() => toggleAdmin(user.id, user.is_admin)}
										class="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
									>
										{user.is_admin ? $t('admin.revokeAdmin') : $t('admin.makeAdmin')}
									</button>
									<button
										on:click={() => handleDeleteUser(user.id, user.email)}
										class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
									>
										{$t('admin.delete')}
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="mt-6 text-gray-600 dark:text-gray-400">
			<p>{$t('admin.totalCount').replace('{count}', users.length)}</p>
		</div>
	{/if}
</div>
