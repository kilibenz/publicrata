<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>Register - Publicrata</title>
</svelte:head>

<div class="mx-auto max-w-md pt-12">
	<h1 class="mb-6 text-center text-2xl font-bold text-gray-900">Create Account</h1>

	{#if form?.error}
		<div class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<div>
			<label for="displayName" class="mb-1 block text-sm font-medium text-gray-700">
				Display Name
			</label>
			<input
				type="text"
				id="displayName"
				name="displayName"
				required
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				required
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
				Password
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

		<button
			type="submit"
			class="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
		>
			Register
		</button>

		<p class="text-center text-sm text-gray-500">
			Already have an account? <a href="/auth/login" class="text-brand-600 hover:underline">Login</a>
		</p>
	</form>
</div>
