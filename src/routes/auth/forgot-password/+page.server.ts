import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { randomBytes, createHash } from 'crypto';
import { db } from '$lib/server/db';
import { users, passwordResetTokens } from '$lib/server/db/schema';
import { sendPasswordResetEmail } from '$lib/server/email';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

const TOKEN_EXPIRY_MS = 15 * 60 * 1000;

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/');
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim().toLowerCase();

		if (!email) {
			return fail(400, { error: 'Email is required.' });
		}

		const [user] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (user) {
			await db
				.delete(passwordResetTokens)
				.where(eq(passwordResetTokens.userId, user.id));

			const rawToken = randomBytes(32).toString('hex');
			const tokenHash = createHash('sha256').update(rawToken).digest('hex');

			await db.insert(passwordResetTokens).values({
				userId: user.id,
				tokenHash,
				expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS)
			});

			const baseUrl = env.BASE_URL || 'http://localhost:5173';
			const resetUrl = `${baseUrl}/auth/reset-password?token=${rawToken}`;

			try {
				await sendPasswordResetEmail(email, resetUrl);
			} catch (e) {
				console.error('Failed to send password reset email:', e);
			}
		}

		return { success: true };
	}
};
