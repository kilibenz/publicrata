import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { syncVorgaenge } from '$lib/server/bundestag/sync';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ locals, request }) => {
	const authHeader = request.headers.get('authorization');
	const isCronKey = authHeader === `Bearer ${env.BUNDESTAG_API_KEY}`;

	if (!locals.user && !isCronKey) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	try {
		const result = await syncVorgaenge(20);
		return json({ success: true, ...result });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Sync failed';
		return json({ error: message }, { status: 500 });
	}
};
