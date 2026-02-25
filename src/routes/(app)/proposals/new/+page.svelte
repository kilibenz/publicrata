<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<svelte:head>
	<title>New Proposal - Publicrata</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<div class="mb-4">
		<a href="/proposals" class="text-sm text-brand-500 hover:underline">&larr; Back to Proposals</a>
	</div>

	<h1 class="mb-6 text-2xl font-bold text-gray-100">Create a Proposal</h1>

	{#if form?.error}
		<div class="mb-4 rounded-md bg-red-900/40 p-3 text-sm text-red-400">
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-sm">
		<div>
			<label for="title" class="mb-1 block text-sm font-medium text-gray-300">Title</label>
			<input
				type="text"
				id="title"
				name="title"
				required
				minlength="5"
				placeholder="What should be decided?"
				class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="description" class="mb-1 block text-sm font-medium text-gray-300">
				Description
			</label>
			<textarea
				id="description"
				name="description"
				rows="6"
				placeholder="Provide context, arguments, and details for your proposal..."
				class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
			></textarea>
		</div>

		<div>
			<label for="daysOpen" class="mb-1 block text-sm font-medium text-gray-300">
				Voting Duration (days)
			</label>
			<select
				id="daysOpen"
				name="daysOpen"
				class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
			>
				<option value="7">7 days</option>
				<option value="14" selected>14 days</option>
				<option value="30">30 days</option>
				<option value="90">90 days</option>
			</select>
		</div>

		<button
			type="submit"
			class="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
		>
			Create Proposal
		</button>
	</form>
</div>
