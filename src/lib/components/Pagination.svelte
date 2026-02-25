<script lang="ts">
	let {
		page,
		totalPages,
		baseUrl
	}: {
		page: number;
		totalPages: number;
		baseUrl: string;
	} = $props();

	function pageUrl(p: number) {
		const url = new URL(baseUrl, 'http://localhost');
		url.searchParams.set('page', String(p));
		return `${url.pathname}${url.search}`;
	}
</script>

{#if totalPages > 1}
	<nav class="mt-6 flex items-center justify-center gap-2">
		{#if page > 1}
			<a
				href={pageUrl(page - 1)}
				class="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
			>
				Previous
			</a>
		{/if}

		{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
			{#if p === page}
				<span class="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
					{p}
				</span>
			{:else if Math.abs(p - page) <= 2 || p === 1 || p === totalPages}
				<a
					href={pageUrl(p)}
					class="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
				>
					{p}
				</a>
			{:else if Math.abs(p - page) === 3}
				<span class="px-1 text-gray-500">...</span>
			{/if}
		{/each}

		{#if page < totalPages}
			<a
				href={pageUrl(page + 1)}
				class="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
			>
				Next
			</a>
		{/if}
	</nav>
{/if}
