<script lang="ts">
	import Self from './CommentThread.svelte';
	import type { CommentNode } from '$lib/types';

	let {
		comments,
		topicId,
		userId = null,
		depth = 0
	}: {
		comments: CommentNode[];
		topicId: string;
		userId: string | null;
		depth?: number;
	} = $props();

	let replyingTo = $state<string | null>(null);
	let replyContent = $state('');
	let submitting = $state(false);
	let editingId = $state<string | null>(null);
	let editContent = $state('');

	async function submitReply(parentId: string | null) {
		if (!replyContent.trim() || submitting) return;
		submitting = true;

		try {
			const res = await fetch('/api/comment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topicId, parentId, content: replyContent })
			});

			if (res.ok) {
				replyContent = '';
				replyingTo = null;
				window.location.reload();
			}
		} finally {
			submitting = false;
		}
	}

	async function saveEdit(commentId: string) {
		if (!editContent.trim() || submitting) return;
		submitting = true;

		try {
			const res = await fetch('/api/comment', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ commentId, content: editContent })
			});

			if (res.ok) {
				editingId = null;
				window.location.reload();
			}
		} finally {
			submitting = false;
		}
	}

	async function deleteComment(commentId: string) {
		if (!confirm('Delete this comment?')) return;

		await fetch('/api/comment', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ commentId })
		});

		window.location.reload();
	}

	function timeAgo(dateStr: string): string {
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}
</script>

{#each comments as comment (comment.id)}
	<div class="border-l-2 border-gray-800 pl-4 {depth > 0 ? 'ml-4' : ''} mt-3">
		<div class="flex items-center gap-2 text-xs text-gray-500">
			<span class="font-medium text-gray-300">{comment.authorName}</span>
			<span>&middot;</span>
			<span>{timeAgo(comment.createdAt)}</span>
		</div>

		{#if editingId === comment.id}
			<textarea
				bind:value={editContent}
				class="mt-1 w-full rounded border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
				rows="3"
			></textarea>
			<div class="mt-1 flex gap-2">
				<button
					onclick={() => saveEdit(comment.id)}
					disabled={submitting}
					class="rounded bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-700"
				>
					Save
				</button>
				<button
					onclick={() => (editingId = null)}
					class="rounded bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700"
				>
					Cancel
				</button>
			</div>
		{:else}
			<p class="mt-1 text-sm whitespace-pre-wrap text-gray-200">{comment.content}</p>

			<div class="mt-1 flex gap-3 text-xs">
				{#if userId}
					<button
						onclick={() => {
							replyingTo = replyingTo === comment.id ? null : comment.id;
							replyContent = '';
						}}
						class="text-gray-500 hover:text-brand-500"
					>
						Reply
					</button>
				{/if}
				{#if userId === comment.authorId}
					<button
						onclick={() => {
							editingId = comment.id;
							editContent = comment.content;
						}}
						class="text-gray-500 hover:text-brand-500"
					>
						Edit
					</button>
					<button
						onclick={() => deleteComment(comment.id)}
						class="text-gray-500 hover:text-red-500"
					>
						Delete
					</button>
				{/if}
			</div>
		{/if}

		{#if replyingTo === comment.id}
			<div class="mt-2 ml-4">
				<textarea
					bind:value={replyContent}
					placeholder="Write a reply..."
					class="w-full rounded border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
					rows="2"
				></textarea>
				<button
					onclick={() => submitReply(comment.id)}
					disabled={submitting}
					class="mt-1 rounded bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-700"
				>
					Post Reply
				</button>
			</div>
		{/if}

		{#if comment.children.length > 0}
			<Self comments={comment.children} {topicId} {userId} depth={depth + 1} />
		{/if}
	</div>
{/each}
