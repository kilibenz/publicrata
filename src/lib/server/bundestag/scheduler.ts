import { syncVorgaenge } from './sync';
import { db } from '$lib/server/db';
import { bundestagVorgaenge } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

let schedulerStarted = false;
let syncTimer: ReturnType<typeof setInterval> | null = null;

export async function getLastSyncTime(): Promise<Date | null> {
	const [row] = await db
		.select({ syncedAt: bundestagVorgaenge.syncedAt })
		.from(bundestagVorgaenge)
		.orderBy(desc(bundestagVorgaenge.syncedAt))
		.limit(1);
	return row?.syncedAt ?? null;
}

export async function isDataStale(): Promise<boolean> {
	const lastSync = await getLastSyncTime();
	if (!lastSync) return true;
	return Date.now() - lastSync.getTime() > STALE_THRESHOLD_MS;
}

async function runSync() {
	try {
		const stale = await isDataStale();
		if (!stale) return;

		console.log('[bundestag-sync] Starting automatic sync…');
		const result = await syncVorgaenge(20, { maxPages: 10, daysSince: 90 });
		console.log(
			`[bundestag-sync] Done: ${result.synced} synced, ${result.created} new topics created`
		);
	} catch (err) {
		console.error('[bundestag-sync] Auto-sync failed:', err);
	}
}

export function startScheduler() {
	if (schedulerStarted) return;
	schedulerStarted = true;

	// Initial sync after a short delay to let the server finish starting
	setTimeout(() => runSync(), 5_000);

	syncTimer = setInterval(() => runSync(), SYNC_INTERVAL_MS);
	console.log('[bundestag-sync] Scheduler started (every 6 hours)');
}

export function stopScheduler() {
	if (syncTimer) {
		clearInterval(syncTimer);
		syncTimer = null;
	}
	schedulerStarted = false;
}
