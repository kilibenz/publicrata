import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import { dev } from '$app/environment';

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			displayName: attributes.displayName,
			eidVerified: attributes.eidVerified
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			email: string;
			displayName: string;
			eidVerified: boolean;
		};
	}
}

export type SessionUser = {
	id: string;
	email: string;
	displayName: string;
	eidVerified: boolean;
};
