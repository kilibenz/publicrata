<script lang="ts">
	import VoteCard from '$lib/components/VoteCard.svelte';
	import CommentThread from '$lib/components/CommentThread.svelte';

	let { data } = $props();

	let newComment = $state('');
	let submitting = $state(false);

	async function postComment() {
		if (!newComment.trim() || submitting) return;
		submitting = true;
		try {
			const res = await fetch('/api/comment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topicId: data.topic.id, parentId: null, content: newComment })
			});
			if (res.ok) {
				newComment = '';
				window.location.reload();
			}
		} finally {
			submitting = false;
		}
	}

	function formatDate(iso: string | null) {
		if (!iso) return 'N/A';
		return new Date(iso).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{data.topic.title} - Publicrata</title>
</svelte:head>

<div class="mb-4">
	<a href="/proposals" class="text-sm text-brand-500 hover:underline">&larr; Back to Proposals</a>
</div>

<div class="grid gap-6 lg:grid-cols-3">
	<div class="lg:col-span-2">
		<div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
			<div class="mb-3 flex items-center gap-2">
				<span class="rounded bg-purple-900/40 px-2 py-0.5 text-xs font-medium text-purple-400">
					Proposal
				</span>
				<span
					class="rounded px-2 py-0.5 text-xs font-medium
						{data.topic.status === 'open' ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'}"
				>
					{data.topic.status}
				</span>
			</div>

			<h1 class="text-2xl font-bold text-gray-100">{data.topic.title}</h1>

			<div class="mt-2 flex gap-4 text-xs text-gray-500">
				{#if data.topic.authorName}
					<span>by {data.topic.authorName}</span>
				{/if}
				<span>Opens {formatDate(data.topic.votingOpensAt)}</span>
				<span>Closes {formatDate(data.topic.votingClosesAt)}</span>
			</div>

			{#if data.topic.description}
				<p class="mt-4 text-gray-300 whitespace-pre-wrap">{data.topic.description}</p>
			{/if}
		</div>

		<div class="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-100">Discussion</h2>

			{#if data.user}
				<div class="mb-4">
					<textarea
						bind:value={newComment}
						placeholder="Share your thoughts..."
						class="w-full rounded-md border border-gray-700 bg-gray-800 p-3 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
						rows="3"
					></textarea>
					<button
						onclick={postComment}
						disabled={submitting || !newComment.trim()}
						class="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
					>
						Post Comment
					</button>
				</div>
			{:else}
				<p class="mb-4 text-sm text-gray-400">
					<a href="/auth/login" class="text-brand-500 hover:underline">Login</a> to join the discussion.
				</p>
			{/if}

			{#if data.comments.length === 0}
				<p class="py-6 text-center text-sm text-gray-500">No comments yet. Start the discussion!</p>
			{:else}
				<CommentThread
					comments={data.comments}
					topicId={data.topic.id}
					userId={data.user?.id ?? null}
				/>
			{/if}
		</div>
	</div>

	<div class="lg:col-span-1">
		<VoteCard
			topicId={data.topic.id}
			userVote={data.userVote}
			counts={data.counts}
			isOpen={data.topic.status === 'open'}
			isLoggedIn={!!data.user}
		/>
	</div>
</div>
