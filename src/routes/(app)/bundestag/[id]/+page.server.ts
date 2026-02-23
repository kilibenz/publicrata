import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { votingTopics, votes, comments, users, bundestagVorgaenge } from '$lib/server/db/schema';
import { eq, and, sql, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [topic] = await db
		.select()
		.from(votingTopics)
		.where(eq(votingTopics.id, params.id))
		.limit(1);

	if (!topic) throw error(404, 'Topic not found');

	let vorgang = null;
	if (topic.bundestagVorgangId) {
		const [v] = await db
			.select()
			.from(bundestagVorgaenge)
			.where(eq(bundestagVorgaenge.id, topic.bundestagVorgangId))
			.limit(1);
		vorgang = v ?? null;
	}

	const voteCounts = await db
		.select({
			choice: votes.choice,
			count: sql<number>`count(*)::int`
		})
		.from(votes)
		.where(eq(votes.topicId, params.id))
		.groupBy(votes.choice);

	const counts = { yes: 0, no: 0, abstain: 0, total: 0 };
	for (const row of voteCounts) {
		counts[row.choice as keyof typeof counts] = row.count;
		counts.total += row.count;
	}

	let userVote: string | null = null;
	if (locals.user) {
		const [v] = await db
			.select({ choice: votes.choice })
			.from(votes)
			.where(and(eq(votes.userId, locals.user.id), eq(votes.topicId, params.id)))
			.limit(1);
		userVote = v?.choice ?? null;
	}

	const rawComments = await db
		.select({
			id: comments.id,
			content: comments.content,
			parentId: comments.parentId,
			authorId: comments.authorId,
			authorName: users.displayName,
			createdAt: comments.createdAt
		})
		.from(comments)
		.innerJoin(users, eq(comments.authorId, users.id))
		.where(eq(comments.topicId, params.id))
		.orderBy(asc(comments.createdAt));

	type CommentTree = {
		id: string;
		content: string;
		authorName: string;
		authorId: string;
		createdAt: string;
		children: CommentTree[];
	};

	const commentMap = new Map<string, CommentTree>();
	const rootComments: CommentTree[] = [];

	for (const c of rawComments) {
		const node: CommentTree = {
			id: c.id,
			content: c.content,
			authorName: c.authorName,
			authorId: c.authorId,
			createdAt: c.createdAt.toISOString(),
			children: []
		};
		commentMap.set(c.id, node);
	}

	for (const c of rawComments) {
		const node = commentMap.get(c.id)!;
		if (c.parentId && commentMap.has(c.parentId)) {
			commentMap.get(c.parentId)!.children.push(node);
		} else {
			rootComments.push(node);
		}
	}

	return {
		topic: {
			...topic,
			createdAt: topic.createdAt.toISOString(),
			votingOpensAt: topic.votingOpensAt?.toISOString() ?? null,
			votingClosesAt: topic.votingClosesAt?.toISOString() ?? null
		},
		vorgang: vorgang
			? {
					...vorgang,
					syncedAt: vorgang.syncedAt.toISOString()
				}
			: null,
		counts,
		userVote,
		comments: rootComments
	};
};
