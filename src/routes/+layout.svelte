<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { data, children } = $props();
</script>

<div class="min-h-screen bg-gray-50 text-gray-900">
	<Navbar user={data.user} />
	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children()}
	</main>
</div>
