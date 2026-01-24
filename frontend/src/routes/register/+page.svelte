<script>
	import { goto } from '$app/navigation';
	import { t } from '$lib/stores/language';
	import AuthForm from '$lib/components/AuthForm.svelte';

	let mode = 'register';

	function handleLoginSuccess() {
		goto('/profile');
	}

	function handleRegisterSuccess() {
		// After registration, redirect to login
		goto('/login');
	}

	function handleModeChange(event) {
		mode = event.detail.mode;
		// If switching to login mode, redirect to login page
		if (mode !== 'register') {
			goto('/login');
		}
	}
</script>

<div class="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
		<h2 class="text-2xl font-bold text-[#304b50] dark:text-white mb-6">{$t('register.title')}</h2>

		<AuthForm
			bind:mode
			showModeSwitch={false}
			on:loginsuccess={handleLoginSuccess}
			on:registersuccess={handleRegisterSuccess}
			on:modechange={handleModeChange}
		/>
	</div>
</div>
