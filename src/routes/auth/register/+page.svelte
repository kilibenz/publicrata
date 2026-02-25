<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Register - Publicrata</title>
</svelte:head>

<div class="mx-auto max-w-md pt-12">
	<h1 class="mb-6 text-center text-2xl font-bold text-gray-100">Create Account</h1>

	{#if form?.error}
		<div class="mb-4 rounded-md bg-red-900/40 p-3 text-sm text-red-400">
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-sm">
		<div>
			<label for="displayName" class="mb-1 block text-sm font-medium text-gray-300">
				Display Name
			</label>
			<input
				type="text"
				id="displayName"
				name="displayName"
				required
				class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-gray-300">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				required
				class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="password" class="mb-1 block text-sm font-medium text-gray-300">
				Password
			</label>
			<input
				type="password"
				id="password"
				name="password"
				required
				minlength="8"
				class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
			/>
		</div>

		<button
			type="submit"
			class="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
		>
			Register
		</button>

		<p class="text-center text-sm text-gray-400">
			Already have an account? <a href="/auth/login" class="text-brand-500 hover:underline">Login</a>
		</p>
	</form>
</div>
