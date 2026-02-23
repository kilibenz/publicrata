declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth/lucia').SessionUser | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};
