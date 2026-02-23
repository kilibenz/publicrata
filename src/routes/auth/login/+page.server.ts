import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
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

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (!user) {
			return fail(400, { error: 'Invalid email or password.' });
		}

		const valid = await verify(user.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!valid) {
			return fail(400, { error: 'Invalid email or password.' });
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(302, '/');
	}
};
