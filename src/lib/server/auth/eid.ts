import { env } from '$env/dynamic/private';

export interface EidVerificationResult {
	verified: boolean;
	givenName?: string;
	familyName?: string;
	dateOfBirth?: string;
	placeOfResidence?: string;
	errorCode?: string;
	errorMessage?: string;
}

export interface EidProvider {
	startVerification(redirectUrl: string): Promise<{ authUrl: string; state: string }>;
	handleCallback(code: string, state: string): Promise<EidVerificationResult>;
}

export function isEidEnabled(): boolean {
	return env.EID_ENABLED === 'true';
}

/**
 * Stub implementation -- replace with AusweisIDent / BundID OIDC provider
 * once authorization certificate is obtained from BVA.
 */
export class EidProviderStub implements EidProvider {
	async startVerification(_redirectUrl: string): Promise<{ authUrl: string; state: string }> {
		throw new Error(
			'eID verification is not yet configured. Apply for an authorization certificate from the BVA.'
		);
	}

	async handleCallback(_code: string, _state: string): Promise<EidVerificationResult> {
		throw new Error('eID verification is not yet configured.');
	}
}

export const eidProvider: EidProvider = new EidProviderStub();
