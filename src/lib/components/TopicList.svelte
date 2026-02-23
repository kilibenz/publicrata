<script lang="ts">
	type TopicSummary = {
		id: string;
		title: string;
		type: string;
		status: string;
		description: string | null;
		createdAt: string;
		voteCount: number;
		commentCount: number;
	};

	let {
		topics,
		baseUrl = ''
	}: {
		topics: TopicSummary[];
		baseUrl?: string;
	} = $props();

	function statusColor(status: string) {
		switch (status) {
			case 'open':
				return 'bg-green-100 text-green-700';
			case 'closed':
				return 'bg-gray-100 text-gray-600';
			case 'draft':
				return 'bg-yellow-100 text-yellow-700';
			default:
				return 'bg-gray-100 text-gray-600';
		}
	}

	function typeLabel(type: string) {
		return type === 'bundestag' ? 'Bundestag' : 'Proposal';
	}
</script>

{#if topics.length === 0}
	<p class="py-12 text-center text-gray-400">No topics found.</p>
{:else}
	<div class="space-y-3">
		{#each topics as topic}
			<a
				href="{baseUrl}/{topic.type === 'bundestag' ? 'bundestag' : 'proposals'}/{topic.id}"
				class="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
			>
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<div class="mb-1 flex items-center gap-2">
							<span class="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">
								{typeLabel(topic.type)}
							</span>
							<span class="rounded px-1.5 py-0.5 text-xs font-medium {statusColor(topic.status)}">
								{topic.status}
							</span>
						</div>
						<h3 class="text-sm font-semibold text-gray-900 line-clamp-2">{topic.title}</h3>
						{#if topic.description}
							<p class="mt-1 text-xs text-gray-500 line-clamp-2">{topic.description}</p>
						{/if}
					</div>
					<div class="flex shrink-0 gap-4 text-xs text-gray-400">
						<span>{topic.voteCount} votes</span>
						<span>{topic.commentCount} comments</span>
					</div>
				</div>
			</a>
		{/each}
	</div>
{/if}
