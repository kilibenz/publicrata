<script lang="ts">
	import TopicList from '$lib/components/TopicList.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Publicrata - Democratic Participation</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-bold text-gray-900">Active Votes</h1>
	<p class="mt-2 text-gray-500">
		Vote on Bundestag proceedings and community proposals. Your voice matters.
	</p>
</div>

<div class="mb-4 flex gap-3">
	<a
		href="/bundestag"
		class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
	>
		Bundestag Agenda
	</a>
	<a
		href="/proposals"
		class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
	>
		User Proposals
	</a>
</div>

<TopicList topics={data.topics} />
<Pagination page={data.page} totalPages={data.totalPages} baseUrl="/" />
