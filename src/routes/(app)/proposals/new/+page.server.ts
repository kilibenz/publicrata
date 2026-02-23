import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { votingTopics } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/auth/login');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/auth/login');

		const form = await request.formData();
		const title = form.get('title')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const daysOpen = Number(form.get('daysOpen')) || 14;

		if (!title) {
			return fail(400, { error: 'Title is required.' });
		}

		if (title.length < 5) {
			return fail(400, { error: 'Title must be at least 5 characters.' });
		}

		const now = new Date();
		const closesAt = new Date(now.getTime() + daysOpen * 24 * 60 * 60 * 1000);

		const [topic] = await db
			.insert(votingTopics)
			.values({
				type: 'user_proposal',
				authorId: locals.user.id,
				title,
				description: description || null,
				status: 'open',
				votingOpensAt: now,
				votingClosesAt: closesAt
			})
			.returning({ id: votingTopics.id });

		throw redirect(302, `/proposals/${topic.id}`);
	}
};
