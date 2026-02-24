import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import { users, passwordResetTokens, sessions } from '$lib/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';

function hashToken(raw: string): string {
	return createHash('sha256').update(raw).digest('hex');
}

async function findValidToken(rawToken: string) {
	const tokenHash = hashToken(rawToken);

	const [record] = await db
		.select()
		.from(passwordResetTokens)
		.where(
			and(
				eq(passwordResetTokens.tokenHash, tokenHash),
				gt(passwordResetTokens.expiresAt, new Date())
			)
		)
		.limit(1);

	return record ?? null;
}

export const load: PageServerLoad = async ({ url }) => {
	const rawToken = url.searchParams.get('token');

	if (!rawToken) {
		return { valid: false };
	}

	const record = await findValidToken(rawToken);
	return { valid: !!record };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const rawToken = form.get('token')?.toString();
		const password = form.get('password')?.toString();
		const confirmPassword = form.get('confirmPassword')?.toString();

		if (!rawToken) {
			return fail(400, { error: 'Invalid reset link.' });
		}

		if (!password || password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.' });
		}

		const record = await findValidToken(rawToken);

		if (!record) {
			return fail(400, { error: 'This reset link is invalid or has expired. Please request a new one.' });
		}

		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		await db
			.update(users)
			.set({ passwordHash })
			.where(eq(users.id, record.userId));

		await db
			.delete(passwordResetTokens)
			.where(eq(passwordResetTokens.userId, record.userId));

		await db
			.delete(sessions)
			.where(eq(sessions.userId, record.userId));

		throw redirect(302, '/auth/login?reset=success');
	}
};
