<script>
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/stores/language';
	import { login, register, requestMagicLink, verifyMagicLink } from '$lib/api';

	export let mode = 'magic'; // 'magic', 'login', 'register'
	export let showModeSwitch = true; // Show tabs to switch between modes
	export let showFooterLinks = true; // Show "No account?" / "Has account?" links
	export let error = '';
	export let success = '';

	const dispatch = createEventDispatcher();

	let email = '';
	let password = '';
	let confirmPassword = '';
	let fullName = '';
	let twoFactorCode = '';
	let needs2FA = false;
	let loading = false;

	// Magic code verification state
	let awaitingCode = false;
	let verificationCode = '';
	let codeInputs = ['', '', '', '', '', ''];
	let codeInputRefs = [];

	function clearMessages() {
		error = '';
		success = '';
	}

	function switchMode(newMode) {
		mode = newMode;
		clearMessages();
		needs2FA = false;
		awaitingCode = false;
		verificationCode = '';
		codeInputs = ['', '', '', '', '', ''];
		dispatch('modechange', { mode: newMode });
	}

	function handleCodeInput(index, event) {
		const value = event.target.value.replace(/\D/g, '');
		codeInputs[index] = value.slice(-1); // Only keep last digit

		// Auto-advance to next input
		if (value && index < 5) {
			codeInputRefs[index + 1]?.focus();
		}

		// Combine all inputs
		verificationCode = codeInputs.join('');

		// Auto-submit when all 6 digits are entered
		if (verificationCode.length === 6) {
			handleVerifyCode();
		}
	}

	function handleCodeKeydown(index, event) {
		// Handle backspace - go to previous input
		if (event.key === 'Backspace' && !codeInputs[index] && index > 0) {
			codeInputRefs[index - 1]?.focus();
		}
	}

	function handleCodePaste(event) {
		event.preventDefault();
		const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

		for (let i = 0; i < 6; i++) {
			codeInputs[i] = pastedData[i] || '';
		}

		verificationCode = codeInputs.join('');

		// Focus last filled input or first empty
		const nextEmptyIndex = codeInputs.findIndex((c) => !c);
		if (nextEmptyIndex >= 0) {
			codeInputRefs[nextEmptyIndex]?.focus();
		} else {
			codeInputRefs[5]?.focus();
		}

		// Auto-submit if complete
		if (verificationCode.length === 6) {
			handleVerifyCode();
		}
	}

	async function handleVerifyCode() {
		if (verificationCode.length !== 6) {
			error = 'Bitte gib den 6-stelligen Code ein';
			return;
		}

		clearMessages();
		loading = true;

		try {
			await verifyMagicLink(verificationCode);
			dispatch('loginsuccess', { email });
		} catch (err) {
			error = err.message;
			// Clear the code inputs on error
			codeInputs = ['', '', '', '', '', ''];
			verificationCode = '';
			codeInputRefs[0]?.focus();
		} finally {
			loading = false;
		}
	}

	function goBackToEmail() {
		awaitingCode = false;
		verificationCode = '';
		codeInputs = ['', '', '', '', '', ''];
		clearMessages();
	}

	async function handleMagicLink() {
		clearMessages();
		loading = true;

		try {
			dispatch('beforemagiclink');
			await requestMagicLink(email);
			awaitingCode = true;
			success = $t('login.magicLinkSent');
			dispatch('magiclinksent', { email });
			// Focus first code input after a short delay
			setTimeout(() => codeInputRefs[0]?.focus(), 100);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function handleLogin() {
		clearMessages();
		loading = true;

		try {
			await login(email, password, needs2FA ? twoFactorCode : null);
			dispatch('loginsuccess', { email });
		} catch (err) {
			if (err.message.includes('Two-factor authentication code required')) {
				needs2FA = true;
			} else {
				error = err.message;
			}
		} finally {
			loading = false;
		}
	}

	async function handleRegister() {
		clearMessages();

		if (!fullName || fullName.trim().length < 2) {
			error = $t('register.fullNameRequired');
			return;
		}

		if (password !== confirmPassword) {
			error = $t('register.passwordMismatch');
			return;
		}

		if (password.length < 8) {
			error = $t('register.passwordTooShort');
			return;
		}

		loading = true;

		try {
			await register(email, password, fullName.trim());
			dispatch('registersuccess', { email });
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function handleSubmit() {
		if (mode === 'magic') {
			handleMagicLink();
		} else if (mode === 'login') {
			handleLogin();
		} else if (mode === 'register') {
			handleRegister();
		}
	}
</script>

<div>
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

	{#if showModeSwitch && mode !== 'register'}
		<!-- Login Method Tabs -->
		<div class="flex mb-6 border-b border-gray-200 dark:border-gray-600">
			<button
				type="button"
				on:click={() => switchMode('magic')}
				class="flex-1 py-2 text-center border-b-2 transition-colors {mode === 'magic'
					? 'border-[#304b50] text-[#304b50] dark:border-[#06E481] dark:text-[#06E481]'
					: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
			>
				{$t('login.magicLink')}
			</button>
			<button
				type="button"
				on:click={() => switchMode('login')}
				class="flex-1 py-2 text-center border-b-2 transition-colors {mode === 'login'
					? 'border-[#304b50] text-[#304b50] dark:border-[#06E481] dark:text-[#06E481]'
					: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
			>
				{$t('login.password')}
			</button>
		</div>
	{/if}

	<!-- Magic Link Form -->
	{#if mode === 'magic'}
		{#if awaitingCode}
			<!-- Code Verification Step -->
			<div class="text-center">
				<p class="text-gray-700 dark:text-gray-300 mb-2">
					Code gesendet an:
				</p>
				<p class="font-semibold text-[#304b50] dark:text-white mb-6">
					{email}
				</p>

				<p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">
					Gib den 6-stelligen Code aus der E-Mail ein:
				</p>

				<!-- 6-digit code input -->
				<div class="flex justify-center gap-2 mb-6" on:paste={handleCodePaste}>
					{#each codeInputs as digit, i}
						<input
							type="text"
							inputmode="numeric"
							maxlength="1"
							bind:value={codeInputs[i]}
							bind:this={codeInputRefs[i]}
							on:input={(e) => handleCodeInput(i, e)}
							on:keydown={(e) => handleCodeKeydown(i, e)}
							class="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-[#06E481] focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
						/>
					{/each}
				</div>

				<button
					type="button"
					on:click={handleVerifyCode}
					disabled={loading || verificationCode.length !== 6}
					class="w-full bg-[#06E481] text-[#304b50] font-semibold py-2 px-4 rounded-md hover:bg-[#05b667] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-4"
				>
					{loading ? 'Wird überprüft...' : 'Bestätigen'}
				</button>

				<div class="flex justify-between text-sm">
					<button
						type="button"
						on:click={goBackToEmail}
						class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
					>
						&larr; Andere E-Mail
					</button>
					<button
						type="button"
						on:click={handleMagicLink}
						disabled={loading}
						class="text-[#06E481] hover:underline disabled:opacity-50"
					>
						Code erneut senden
					</button>
				</div>
			</div>
		{:else}
			<!-- Email Input Step -->
			<form on:submit|preventDefault={handleSubmit}>
				<div class="mb-4">
					<label for="email" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
						{$t('login.email')}
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full bg-[#06E481] text-[#304b50] font-semibold py-2 px-4 rounded-md hover:bg-[#05b667] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
				>
					{loading ? $t('login.sendingLink') : $t('login.sendLink')}
				</button>
			</form>

			<p class="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
				{$t('login.magicLinkInfo')}
			</p>
		{/if}
	{/if}

	<!-- Login Form -->
	{#if mode === 'login'}
		<form on:submit|preventDefault={handleSubmit}>
			<div class="mb-4">
				<label for="emailLogin" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
					{$t('login.email')}
				</label>
				<input
					type="email"
					id="emailLogin"
					bind:value={email}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
				/>
			</div>

			<div class="mb-4">
				<label for="password" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
					{$t('login.password')}
				</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
				/>
			</div>

			{#if needs2FA}
				<div class="mb-4">
					<label for="twoFactorCode" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
						{$t('login.2faCode')}
					</label>
					<input
						type="text"
						id="twoFactorCode"
						bind:value={twoFactorCode}
						required
						placeholder="123456"
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
					/>
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-[#06E481] text-[#304b50] font-semibold py-2 px-4 rounded-md hover:bg-[#05b667] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
			>
				{loading ? $t('login.submitting') : $t('login.submit')}
			</button>
		</form>
	{/if}

	<!-- Register Form -->
	{#if mode === 'register'}
		<form on:submit|preventDefault={handleSubmit}>
			<div class="mb-4">
				<label for="fullName" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
					{$t('register.fullName')} <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					id="fullName"
					bind:value={fullName}
					required
					minlength="2"
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
				/>
			</div>

			<div class="mb-4">
				<label for="emailRegister" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
					{$t('login.email')}
				</label>
				<input
					type="email"
					id="emailRegister"
					bind:value={email}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
				/>
			</div>

			<div class="mb-4">
				<label for="passwordRegister" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
					{$t('login.password')}
				</label>
				<input
					type="password"
					id="passwordRegister"
					bind:value={password}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
				/>
			</div>

			<div class="mb-6">
				<label for="confirmPassword" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
					{$t('register.confirmPassword')}
				</label>
				<input
					type="password"
					id="confirmPassword"
					bind:value={confirmPassword}
					required
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06E481] bg-white dark:bg-gray-700 text-[#304b50] dark:text-white"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-[#06E481] text-[#304b50] font-semibold py-2 px-4 rounded-md hover:bg-[#05b667] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
			>
				{loading ? $t('register.submitting') : $t('register.submit')}
			</button>
		</form>
	{/if}

	<!-- Footer Links -->
	{#if showFooterLinks}
		<div class="mt-6 text-center space-y-2">
			{#if mode === 'register'}
				<p class="text-gray-600 dark:text-gray-400">
					{$t('register.hasAccount')}
					<button
						type="button"
						on:click={() => switchMode('magic')}
						class="text-[#06E481] hover:underline font-medium"
					>
						{$t('nav.login')}
					</button>
				</p>
			{:else}
				<p class="text-gray-600 dark:text-gray-400">
					{$t('login.noAccount')}
					<button
						type="button"
						on:click={() => switchMode('register')}
						class="text-[#06E481] hover:underline font-medium"
					>
						{$t('nav.register')}
					</button>
				</p>
				{#if mode === 'login'}
					<p>
						<a href="/forgot-password" class="text-[#304b50] dark:text-[#06E481] hover:underline text-sm">
							{$t('login.forgotPassword')}
						</a>
					</p>
				{/if}
			{/if}
		</div>
	{/if}
</div>
