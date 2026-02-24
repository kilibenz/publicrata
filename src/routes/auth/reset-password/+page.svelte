<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let { data, form } = $props();

	const token = $derived($page.url.searchParams.get('token') ?? '');
</script>

<svelte:head>
	<title>Reset Password - Publicrata</title>
</svelte:head>

<div class="mx-auto max-w-md pt-12">
	<h1 class="mb-6 text-center text-2xl font-bold text-gray-900">Set New Password</h1>

	{#if !data.valid}
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
				This reset link is invalid or has expired.
			</div>
			<p class="text-center text-sm text-gray-500">
				<a href="/auth/forgot-password" class="text-brand-600 hover:underline">Request a new link</a>
			</p>
		</div>
	{:else}
		{#if form?.error}
			<div class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance class="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<input type="hidden" name="token" value={token} />

			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
					New Password
				</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					minlength="8"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">
					Confirm Password
				</label>
				<input
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					required
					minlength="8"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				class="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
			>
				Reset Password
			</button>
		</form>
	{/if}
</div>
