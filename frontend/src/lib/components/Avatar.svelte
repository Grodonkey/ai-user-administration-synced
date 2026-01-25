<script>
	import { getInitials } from '$lib/utils';

	export let name = '';
	export let imageUrl = '';
	export let size = 'md';
	export let href = '';

	$: initials = getInitials(name);

	const sizes = {
		xs: 'w-6 h-6 text-xs',
		sm: 'w-8 h-8 text-xs',
		md: 'w-10 h-10 text-sm',
		lg: 'w-16 h-16 text-lg',
		xl: 'w-24 h-24 text-2xl',
		'2xl': 'w-32 h-32 text-3xl'
	};

	$: sizeClass = sizes[size] || sizes.md;
</script>

{#if href}
	<a {href} class="block">
		{#if imageUrl}
			<img
				src={imageUrl}
				alt={name}
				class="rounded-full object-cover {sizeClass}"
			/>
		{:else}
			<div
				class="rounded-full bg-gradient-to-br from-[#304b50] to-[#06E481] flex items-center justify-center {sizeClass}"
			>
				<span class="font-bold text-white">{initials}</span>
			</div>
		{/if}
	</a>
{:else}
	{#if imageUrl}
		<img
			src={imageUrl}
			alt={name}
			class="rounded-full object-cover {sizeClass}"
		/>
	{:else}
		<div
			class="rounded-full bg-gradient-to-br from-[#304b50] to-[#06E481] flex items-center justify-center {sizeClass}"
		>
			<span class="font-bold text-white">{initials}</span>
		</div>
	{/if}
{/if}
