<script lang="ts">
	import VoteCard from '$lib/components/VoteCard.svelte';
	import CommentThread from '$lib/components/CommentThread.svelte';

	let { data } = $props();

	let newComment = $state('');
	let submitting = $state(false);

	function slugify(text: string): string {
		return text
			.toLowerCase()
			.replace(/[äÄ]/g, 'ae').replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue').replace(/ß/g, 'ss')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 80);
	}

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
</script>

<svelte:head>
	<title>{data.topic.title} - Publicratos</title>
</svelte:head>

<div class="mb-4">
	<a href="/bundestag" class="text-sm text-brand-600 hover:underline">&larr; Back to Bundestag</a>
</div>

<div class="grid gap-6 lg:grid-cols-3">
	<div class="lg:col-span-2">
		<div class="rounded-lg border border-gray-200 bg-white p-6">
			<div class="mb-3 flex items-center gap-2">
				<span class="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
					Bundestag
				</span>
				<span
					class="rounded px-2 py-0.5 text-xs font-medium
						{data.topic.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}"
				>
					{data.topic.status}
				</span>
			</div>

			<h1 class="text-2xl font-bold text-gray-900">{data.topic.title}</h1>

			{#if data.topic.description}
				<p class="mt-3 text-gray-600 whitespace-pre-wrap">{data.topic.description}</p>
			{/if}

			{#if data.vorgang}
				<div class="mt-4 rounded-md bg-gray-50 p-4 text-sm">
					<h3 class="mb-2 font-semibold text-gray-700">Parliamentary Details</h3>
					<dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600">
						{#if data.vorgang.vorgangstyp}
							<dt class="font-medium">Type</dt>
							<dd>{data.vorgang.vorgangstyp}</dd>
						{/if}
						{#if data.vorgang.beratungsstand}
							<dt class="font-medium">Status</dt>
							<dd>{data.vorgang.beratungsstand}</dd>
						{/if}
						{#if data.vorgang.wahlperiode}
							<dt class="font-medium">Wahlperiode</dt>
							<dd>{data.vorgang.wahlperiode}</dd>
						{/if}
						{#if data.vorgang.datum}
							<dt class="font-medium">Date</dt>
							<dd>{data.vorgang.datum}</dd>
						{/if}
					</dl>
					<a
						href="https://dip.bundestag.de/vorgang/{slugify(data.vorgang.titel)}/{data.vorgang.dipId}"
						target="_blank"
						rel="noopener noreferrer"
						class="mt-3 inline-block text-brand-600 hover:underline"
					>
						View on DIP Bundestag &rarr;
					</a>
				</div>
			{/if}
		</div>

		<div class="mt-6 rounded-lg border border-gray-200 bg-white p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Discussion</h2>

			{#if data.user}
				<div class="mb-4">
					<textarea
						bind:value={newComment}
						placeholder="Share your thoughts..."
						class="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
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
				<p class="mb-4 text-sm text-gray-500">
					<a href="/auth/login" class="text-brand-600 hover:underline">Login</a> to join the discussion.
				</p>
			{/if}

			{#if data.comments.length === 0}
				<p class="py-6 text-center text-sm text-gray-400">No comments yet. Start the discussion!</p>
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
