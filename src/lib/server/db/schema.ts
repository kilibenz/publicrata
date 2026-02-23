import {
	pgTable,
	uuid,
	text,
	varchar,
	boolean,
	timestamp,
	integer,
	jsonb,
	pgEnum,
	uniqueIndex,
	date
} from 'drizzle-orm/pg-core';

export const voteChoiceEnum = pgEnum('vote_choice', ['yes', 'no', 'abstain']);

export const topicTypeEnum = pgEnum('topic_type', ['bundestag', 'user_proposal']);

export const topicStatusEnum = pgEnum('topic_status', ['draft', 'open', 'closed', 'archived']);

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	displayName: varchar('display_name', { length: 100 }).notNull(),
	eidVerified: boolean('eid_verified').default(false).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const bundestagVorgaenge = pgTable('bundestag_vorgaenge', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	dipId: integer('dip_id').notNull().unique(),
	titel: text('titel').notNull(),
	abstract: text('abstract'),
	vorgangstyp: varchar('vorgangstyp', { length: 255 }),
	beratungsstand: varchar('beratungsstand', { length: 255 }),
	wahlperiode: integer('wahlperiode'),
	datum: date('datum'),
	deskriptoren: jsonb('deskriptoren'),
	rawJson: jsonb('raw_json'),
	syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull()
});

export const votingTopics = pgTable('voting_topics', {
	id: uuid('id').defaultRandom().primaryKey(),
	type: topicTypeEnum('type').notNull(),
	bundestagVorgangId: integer('bundestag_vorgang_id').references(() => bundestagVorgaenge.id),
	authorId: uuid('author_id').references(() => users.id),
	title: text('title').notNull(),
	description: text('description'),
	votingOpensAt: timestamp('voting_opens_at', { withTimezone: true }),
	votingClosesAt: timestamp('voting_closes_at', { withTimezone: true }),
	status: topicStatusEnum('status').default('open').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const votes = pgTable(
	'votes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		topicId: uuid('topic_id')
			.notNull()
			.references(() => votingTopics.id, { onDelete: 'cascade' }),
		choice: voteChoiceEnum('choice').notNull(),
		votedAt: timestamp('voted_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [uniqueIndex('votes_user_topic_idx').on(table.userId, table.topicId)]
);

export const comments = pgTable('comments', {
	id: uuid('id').defaultRandom().primaryKey(),
	topicId: uuid('topic_id')
		.notNull()
		.references(() => votingTopics.id, { onDelete: 'cascade' }),
	parentId: uuid('parent_id'),
	authorId: uuid('author_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
