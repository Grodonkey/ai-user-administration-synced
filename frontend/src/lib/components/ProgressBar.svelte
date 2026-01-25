<script>
	import { t } from '$lib/stores/language';
	import { formatCurrency, calculateProgress, getProjectTypeAccentColor } from '$lib/utils';

	export let current = 0;
	export let goal = 0;
	export let projectType = 'crowdfunding';
	export let showLabels = true;
	export let showGoal = true;
	export let size = 'md';

	$: progress = calculateProgress(current, goal);
	$: accentColor = getProjectTypeAccentColor(projectType);

	const heights = {
		sm: 'h-1.5',
		md: 'h-2',
		lg: 'h-3'
	};
</script>

<div class="w-full">
	{#if showLabels}
		<div class="flex justify-between text-sm mb-2">
			<span class="font-semibold text-[#304b50] dark:text-white">{formatCurrency(current)}</span>
			<span class="font-bold" style="color: {accentColor}">{progress}%</span>
		</div>
	{/if}
	<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full {heights[size] || heights.md}">
		<div
			class="rounded-full transition-all {heights[size] || heights.md}"
			style="width: {progress}%; background-color: {accentColor}"
		></div>
	</div>
	{#if showGoal && goal}
		<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
			{$t('project.goal')}: {formatCurrency(goal)}
		</div>
	{/if}
</div>
