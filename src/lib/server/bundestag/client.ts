import { env } from '$env/dynamic/private';

const BASE_URL = 'https://search.dip.bundestag.de/api/v1';

export interface DipVorgang {
	id: number;
	titel: string;
	abstract?: string;
	vorgangstyp: string;
	beratungsstand?: string;
	wahlperiode: number;
	datum?: string;
	deskriptoren?: { name: string; typ: string }[];
	initiative?: string[];
}

interface DipListResponse<T> {
	numFound: number;
	documents: T[];
	cursor: string;
}

async function dipFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
	const apiKey = env.BUNDESTAG_API_KEY;
	if (!apiKey) throw new Error('BUNDESTAG_API_KEY is not set');

	const url = new URL(`${BASE_URL}${endpoint}`);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}
	url.searchParams.set('apikey', apiKey);
	url.searchParams.set('format', 'json');

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`DIP API error: ${response.status} ${response.statusText}`);
	}
	return response.json() as Promise<T>;
}

export async function fetchVorgaenge(params: {
	wahlperiode?: number;
	cursor?: string;
	limit?: number;
	updatedSince?: string;
}): Promise<DipListResponse<DipVorgang>> {
	const queryParams: Record<string, string> = {};
	if (params.wahlperiode) queryParams['f.wahlperiode'] = String(params.wahlperiode);
	if (params.cursor) queryParams['cursor'] = params.cursor;
	if (params.limit) queryParams['f.limit'] = String(params.limit);
	if (params.updatedSince) queryParams['f.datum.start'] = params.updatedSince;
	return dipFetch<DipListResponse<DipVorgang>>('/vorgang', queryParams);
}

export async function fetchVorgang(id: number): Promise<DipVorgang> {
	return dipFetch<DipVorgang>(`/vorgang/${id}`);
}
