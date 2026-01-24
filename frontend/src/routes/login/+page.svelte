<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { t } from '$lib/stores/language';
	import AuthForm from '$lib/components/AuthForm.svelte';

	let mode = 'magic';

	// Get redirect URL from query params
	$: redirectUrl = $page.url.searchParams.get('redirect') || '/profile';

	function handleLoginSuccess() {
		goto(redirectUrl);
	}

	function handleRegisterSuccess() {
		// After registration, switch to login mode
		mode = 'magic';
	}

	function handleModeChange(event) {
		mode = event.detail.mode;
	}
</script>

<div class="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
		<h2 class="text-2xl font-bold text-[#304b50] dark:text-white mb-6">
			{mode === 'register' ? $t('register.title') : $t('login.title')}
		</h2>

		<AuthForm
			bind:mode
			on:loginsuccess={handleLoginSuccess}
			on:registersuccess={handleRegisterSuccess}
			on:modechange={handleModeChange}
		/>
	</div>
</div>
