import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth/lucia';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim().toLowerCase();
		const password = form.get('password')?.toString();
		const displayName = form.get('displayName')?.toString().trim();

		if (!email || !password || !displayName) {
			return fail(400, { error: 'All fields are required.' });
		}

		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.' });
		}

		const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
		if (existing.length > 0) {
			return fail(400, { error: 'An account with this email already exists.' });
		}

		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		const [user] = await db
			.insert(users)
			.values({ email, passwordHash, displayName })
			.returning({ id: users.id });

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(302, '/');
	}
};
