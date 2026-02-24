import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

function getResend() {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		throw new Error('RESEND_API_KEY environment variable is not set');
	}
	return new Resend(apiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
	const resend = getResend();

	await resend.emails.send({
		from: 'Publicrata <noreply@publicrata.eu>',
		to,
		subject: 'Reset your password',
		html: `
			<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
				<h2 style="color: #1a1a1a;">Password Reset</h2>
				<p>You requested a password reset for your Publicrata account.</p>
				<p>Click the link below to set a new password. This link expires in 15 minutes.</p>
				<a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">
					Reset Password
				</a>
				<p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
					If you did not request this, you can safely ignore this email.
				</p>
			</div>
		`
	});
}
