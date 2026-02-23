import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { comments, votingTopics } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const { topicId, parentId, content } = await request.json();

	if (!topicId || !content?.trim()) {
		return json({ error: 'Topic ID and content are required' }, { status: 400 });
	}

	const [topic] = await db
		.select({ id: votingTopics.id })
		.from(votingTopics)
		.where(eq(votingTopics.id, topicId))
		.limit(1);

	if (!topic) {
		return json({ error: 'Topic not found' }, { status: 404 });
	}

	const [comment] = await db
		.insert(comments)
		.values({
			topicId,
			parentId: parentId || null,
			authorId: locals.user.id,
			content: content.trim()
		})
		.returning();

	return json({ success: true, comment });
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const { commentId, content } = await request.json();

	if (!commentId || !content?.trim()) {
		return json({ error: 'Comment ID and content are required' }, { status: 400 });
	}

	const [existing] = await db
		.select()
		.from(comments)
		.where(and(eq(comments.id, commentId), eq(comments.authorId, locals.user.id)))
		.limit(1);

	if (!existing) {
		return json({ error: 'Comment not found or not authorized' }, { status: 404 });
	}

	await db
		.update(comments)
		.set({ content: content.trim(), updatedAt: new Date() })
		.where(eq(comments.id, commentId));

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const { commentId } = await request.json();

	const [existing] = await db
		.select()
		.from(comments)
		.where(and(eq(comments.id, commentId), eq(comments.authorId, locals.user.id)))
		.limit(1);

	if (!existing) {
		return json({ error: 'Comment not found or not authorized' }, { status: 404 });
	}

	await db.delete(comments).where(eq(comments.id, commentId));

	return json({ success: true });
};
