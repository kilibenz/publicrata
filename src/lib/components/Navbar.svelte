<script lang="ts">
	import type { SessionUser } from '$lib/server/auth/lucia';

	let { user }: { user: SessionUser | null } = $props();
	let mobileOpen = $state(false);
</script>

<nav class="border-b border-gray-800 bg-gray-900 shadow-sm">
	<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
		<a href="/" class="text-xl font-bold tracking-tight text-brand-500">
			Publicrata
		</a>

		<div class="hidden items-center gap-6 md:flex">
			<a href="/bundestag" class="text-sm font-medium text-gray-300 hover:text-brand-400">
				Bundestag
			</a>
			<a href="/proposals" class="text-sm font-medium text-gray-300 hover:text-brand-400">
				Proposals
			</a>

			{#if user}
				<span class="text-sm text-gray-400">
					{user.displayName}
					{#if user.eidVerified}
						<span class="ml-1 rounded bg-green-900/40 px-1.5 py-0.5 text-xs text-green-400">
							eID
						</span>
					{/if}
				</span>
				<form method="POST" action="/auth/logout">
					<button
						type="submit"
						class="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-700"
					>
						Logout
					</button>
				</form>
			{:else}
				<a
					href="/auth/login"
					class="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
				>
					Login
				</a>
			{/if}
		</div>

		<button
			class="text-gray-300 md:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Toggle menu"
		>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				{#if mobileOpen}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</div>

	{#if mobileOpen}
		<div class="border-t border-gray-800 px-4 py-3 md:hidden">
			<a href="/bundestag" class="block py-2 text-sm text-gray-300">Bundestag</a>
			<a href="/proposals" class="block py-2 text-sm text-gray-300">Proposals</a>
			{#if user}
				<a href="/thoughts" class="block py-2 text-sm text-gray-300">Gedanken</a>
				<form method="POST" action="/auth/logout">
					<button type="submit" class="block py-2 text-sm text-gray-300">Logout</button>
				</form>
			{:else}
				<a href="/auth/login" class="block py-2 text-sm text-brand-500">Login</a>
			{/if}
		</div>
	{/if}
</nav>
