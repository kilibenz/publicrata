import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { votes, votingTopics } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const { topicId, choice } = await request.json();

	if (!topicId || !['yes', 'no', 'abstain'].includes(choice)) {
		return json({ error: 'Invalid vote data' }, { status: 400 });
	}

	const [topic] = await db
		.select()
		.from(votingTopics)
		.where(eq(votingTopics.id, topicId))
		.limit(1);

	if (!topic) {
		return json({ error: 'Topic not found' }, { status: 404 });
	}

	if (topic.status !== 'open') {
		return json({ error: 'Voting is not open for this topic' }, { status: 403 });
	}

	const now = new Date();
	if (topic.votingClosesAt && now > topic.votingClosesAt) {
		return json({ error: 'Voting period has ended' }, { status: 403 });
	}

	const existing = await db
		.select()
		.from(votes)
		.where(and(eq(votes.userId, locals.user.id), eq(votes.topicId, topicId)))
		.limit(1);

	if (existing.length > 0) {
		await db
			.update(votes)
			.set({ choice, votedAt: new Date() })
			.where(eq(votes.id, existing[0].id));
	} else {
		await db.insert(votes).values({
			userId: locals.user.id,
			topicId,
			choice
		});
	}

	return json({ success: true });
};
