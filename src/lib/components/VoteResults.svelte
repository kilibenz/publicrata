<script lang="ts">
	let { counts }: { counts: { yes: number; no: number; abstain: number; total: number } } = $props();

	function pct(n: number) {
		if (counts.total === 0) return 0;
		return Math.round((n / counts.total) * 100);
	}
</script>

<div class="space-y-2">
	<div>
		<div class="mb-1 flex justify-between text-xs">
			<span class="font-medium text-green-700">Ja</span>
			<span class="text-gray-500">{counts.yes} ({pct(counts.yes)}%)</span>
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-gray-100">
			<div class="h-full rounded-full bg-vote-yes transition-all" style="width: {pct(counts.yes)}%"></div>
		</div>
	</div>

	<div>
		<div class="mb-1 flex justify-between text-xs">
			<span class="font-medium text-red-700">Nein</span>
			<span class="text-gray-500">{counts.no} ({pct(counts.no)}%)</span>
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-gray-100">
			<div class="h-full rounded-full bg-vote-no transition-all" style="width: {pct(counts.no)}%"></div>
		</div>
	</div>

	<div>
		<div class="mb-1 flex justify-between text-xs">
			<span class="font-medium text-amber-700">Enthaltung</span>
			<span class="text-gray-500">{counts.abstain} ({pct(counts.abstain)}%)</span>
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-gray-100">
			<div class="h-full rounded-full bg-vote-abstain transition-all" style="width: {pct(counts.abstain)}%"></div>
		</div>
	</div>

	<p class="pt-1 text-xs text-gray-400">{counts.total} total votes</p>
</div>
