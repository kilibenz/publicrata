<script lang="ts">
	import VoteResults from './VoteResults.svelte';

	type VoteCounts = { yes: number; no: number; abstain: number; total: number };

	let {
		topicId,
		userVote = null,
		counts,
		isOpen,
		isLoggedIn
	}: {
		topicId: string;
		userVote: string | null;
		counts: VoteCounts;
		isOpen: boolean;
		isLoggedIn: boolean;
	} = $props();

	let submitting = $state(false);
	let localVote = $state(userVote);
	let localCounts = $state(counts);

	async function castVote(choice: 'yes' | 'no' | 'abstain') {
		if (submitting || !isOpen) return;
		submitting = true;

		const previousVote = localVote;

		if (previousVote) {
			localCounts[previousVote as keyof typeof localCounts]--;
		} else {
			localCounts.total++;
		}
		localCounts[choice]++;
		localVote = choice;

		try {
			const res = await fetch('/api/vote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topicId, choice })
			});
			if (!res.ok) {
				localVote = previousVote;
				localCounts = counts;
			}
		} catch {
			localVote = previousVote;
			localCounts = counts;
		} finally {
			submitting = false;
		}
	}

	const choices = [
		{ key: 'yes' as const, label: 'Ja', color: 'bg-vote-yes hover:bg-green-600' },
		{ key: 'no' as const, label: 'Nein', color: 'bg-vote-no hover:bg-red-600' },
		{ key: 'abstain' as const, label: 'Enthaltung', color: 'bg-vote-abstain hover:bg-amber-600' }
	];
</script>

<div class="rounded-lg border border-gray-800 bg-gray-900 p-4">
	<h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Your Vote</h3>

	{#if !isLoggedIn}
		<p class="text-sm text-gray-400">
			<a href="/auth/login" class="text-brand-500 hover:underline">Login</a> to vote.
		</p>
	{:else if !isOpen}
		<p class="text-sm text-gray-400">Voting is closed.</p>
	{:else}
		<div class="flex gap-2">
			{#each choices as { key, label, color }}
				<button
					onclick={() => castVote(key)}
					disabled={submitting}
					class="flex-1 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors {color}
						{localVote === key ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-brand-500' : 'opacity-80'}"
				>
					{label}
				</button>
			{/each}
		</div>
	{/if}

	<div class="mt-4">
		<VoteResults counts={localCounts} />
	</div>
</div>
