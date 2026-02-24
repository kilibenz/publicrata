<script lang="ts">
	import TopicList from '$lib/components/TopicList.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Proposals - Publicrata</title>
</svelte:head>

<div class="mb-8 flex items-center justify-between">
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Community Proposals</h1>
		<p class="mt-2 text-gray-500">Proposals created by citizens for public voting.</p>
	</div>
	{#if data.user}
		<a
			href="/proposals/new"
			class="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
		>
			New Proposal
		</a>
	{/if}
</div>

<TopicList topics={data.topics} />
<Pagination page={data.page} totalPages={data.totalPages} baseUrl="/proposals" />
