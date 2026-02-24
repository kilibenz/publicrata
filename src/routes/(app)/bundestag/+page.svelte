<script lang="ts">
	import TopicList from '$lib/components/TopicList.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data } = $props();

	let syncing = $state(false);
	let syncMessage = $state('');

	async function triggerSync() {
		syncing = true;
		syncMessage = '';
		try {
			const res = await fetch('/api/bundestag/sync', { method: 'POST' });
			const result = await res.json();
			if (res.ok) {
				syncMessage = `Synced ${result.synced} items, ${result.created} new topics created.`;
				setTimeout(() => window.location.reload(), 1500);
			} else {
				syncMessage = result.error || 'Sync failed.';
			}
		} catch {
			syncMessage = 'Network error.';
		} finally {
			syncing = false;
		}
	}
</script>

<svelte:head>
	<title>Bundestag Agenda - Publicrata</title>
</svelte:head>

<div class="mb-8 flex items-start justify-between">
	<div>
		<h1 class="text-3xl font-bold text-gray-900">Bundestag Agenda</h1>
		<p class="mt-2 text-gray-500">
			Parliamentary proceedings from the Deutscher Bundestag. Vote on actual legislative items.
		</p>
		{#if data.lastSyncAt}
			<p class="mt-1 text-xs text-gray-400">
				Last synced: {new Date(data.lastSyncAt).toLocaleString('de-DE')} · Auto-sync every 6h
			</p>
		{/if}
	</div>
	{#if data.user}
		<button
			onclick={triggerSync}
			disabled={syncing}
			class="shrink-0 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
		>
			{syncing ? 'Syncing...' : 'Sync Bundestag'}
		</button>
	{/if}
</div>

{#if syncMessage}
	<div class="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
		{syncMessage}
	</div>
{/if}

{#if data.topics.length === 0 && !syncing}
	<div class="rounded-lg border border-dashed border-gray-300 py-16 text-center">
		<p class="text-gray-500">No Bundestag proceedings loaded yet.</p>
		{#if data.user}
			<p class="mt-2 text-sm text-gray-400">
				Click <strong>Sync Bundestag</strong> to fetch the latest agenda from the DIP API.
			</p>
		{:else}
			<p class="mt-2 text-sm text-gray-400">
				<a href="/auth/login" class="text-brand-600 hover:underline">Login</a> to trigger a sync.
			</p>
		{/if}
	</div>
{:else}
	<TopicList topics={data.topics} />
	<Pagination page={data.page} totalPages={data.totalPages} baseUrl="/bundestag" />
{/if}
