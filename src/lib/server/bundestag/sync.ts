import { db } from '$lib/server/db';
import { bundestagVorgaenge, votingTopics } from '$lib/server/db/schema';
import { fetchVorgaenge, type DipVorgang } from './client';
import { eq, inArray } from 'drizzle-orm';

export async function syncVorgaenge(
	wahlperiode = 20,
	options?: { maxPages?: number; daysSince?: number }
): Promise<{ synced: number; created: number }> {
	const maxPages = options?.maxPages ?? 10;
	const daysSince = options?.daysSince ?? 365;

	const sinceDate = new Date();
	sinceDate.setDate(sinceDate.getDate() - daysSince);
	const updatedSince = sinceDate.toISOString().split('T')[0];

	let cursor: string | undefined;
	let totalSynced = 0;
	let totalCreated = 0;
	let pageCount = 0;

	do {
		const result = await fetchVorgaenge({
			wahlperiode,
			cursor,
			updatedSince
		});

		if (result.documents.length > 0) {
			const { synced, created } = await upsertBatch(result.documents);
			totalSynced += synced;
			totalCreated += created;
		}

		pageCount++;
		cursor =
			result.documents.length === 100 && pageCount < maxPages ? result.cursor : undefined;
	} while (cursor);

	return { synced: totalSynced, created: totalCreated };
}

async function upsertBatch(
	documents: DipVorgang[]
): Promise<{ synced: number; created: number }> {
	const dipIds = documents.map((d) => Number(d.id));

	const existing = await db
		.select({ id: bundestagVorgaenge.id, dipId: bundestagVorgaenge.dipId })
		.from(bundestagVorgaenge)
		.where(inArray(bundestagVorgaenge.dipId, dipIds));

	const existingDipIds = new Set(existing.map((e) => e.dipId));

	const newDocs = documents.filter((d) => !existingDipIds.has(Number(d.id)));
	const updateDocs = documents.filter((d) => existingDipIds.has(Number(d.id)));

	for (const vorgang of updateDocs) {
		await db
			.update(bundestagVorgaenge)
			.set({
				titel: vorgang.titel,
				abstract: vorgang.abstract ?? null,
				vorgangstyp: vorgang.vorgangstyp,
				beratungsstand: vorgang.beratungsstand ?? null,
				wahlperiode: vorgang.wahlperiode,
				datum: vorgang.datum ?? null,
				deskriptoren: vorgang.deskriptoren ?? null,
				rawJson: vorgang as unknown as Record<string, unknown>,
				syncedAt: new Date()
			})
			.where(eq(bundestagVorgaenge.dipId, Number(vorgang.id)));
	}

	if (newDocs.length > 0) {
		const inserted = await db
			.insert(bundestagVorgaenge)
			.values(
				newDocs.map((vorgang) => ({
					dipId: Number(vorgang.id),
					titel: vorgang.titel,
					abstract: vorgang.abstract ?? null,
					vorgangstyp: vorgang.vorgangstyp,
					beratungsstand: vorgang.beratungsstand ?? null,
					wahlperiode: vorgang.wahlperiode,
					datum: vorgang.datum ?? null,
					deskriptoren: vorgang.deskriptoren ?? null,
					rawJson: vorgang as unknown as Record<string, unknown>,
					syncedAt: new Date()
				}))
			)
			.returning({ id: bundestagVorgaenge.id, dipId: bundestagVorgaenge.dipId });

		const topicValues = inserted.map((row, i) => ({
			type: 'bundestag' as const,
			bundestagVorgangId: row.id,
			title: newDocs[i].titel,
			description: newDocs[i].abstract ?? null,
			status: 'open' as const,
			votingOpensAt: new Date()
		}));

		if (topicValues.length > 0) {
			await db.insert(votingTopics).values(topicValues);
		}
	}

	return { synced: documents.length, created: newDocs.length };
}
