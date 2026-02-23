import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { votingTopics, votes, comments } from '$lib/server/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const limit = 20;
	const offset = (page - 1) * limit;

	const [{ count: totalCount }] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(votingTopics)
		.where(eq(votingTopics.status, 'open'));

	const topics = await db
		.select({
			id: votingTopics.id,
			title: votingTopics.title,
			type: votingTopics.type,
			status: votingTopics.status,
			description: votingTopics.description,
			createdAt: votingTopics.createdAt,
			voteCount: sql<number>`(SELECT count(*)::int FROM votes WHERE votes.topic_id = ${votingTopics.id})`,
			commentCount: sql<number>`(SELECT count(*)::int FROM comments WHERE comments.topic_id = ${votingTopics.id})`
		})
		.from(votingTopics)
		.where(eq(votingTopics.status, 'open'))
		.orderBy(desc(votingTopics.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		topics: topics.map((t) => ({
			...t,
			createdAt: t.createdAt.toISOString()
		})),
		page,
		totalPages: Math.max(1, Math.ceil(totalCount / limit))
	};
};
