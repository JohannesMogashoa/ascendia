import type { InvestecIntegration } from "@prisma/client"; // Import User type from Prisma
import { authenticateWithInvestec } from "../api/routers/users";
import { env } from "~/env";

// Extend the User type to ensure it has the Investec fields for client initialization
export type InvestecUserConfig = Pick<
	InvestecIntegration,
	"accessToken" | "clientSecret" | "apiKey" | "clientId" | "expiresIn"
>;

/**
 * Backend-specific Investec API Client.
 * Handles sensitive operations like token exchange/refresh and API calls.
 */
class ServerInvestecAPIClient {
	private clientId: string;
	private clientSecret: string;
	private apiKey: string;
	private apiBaseUrl: string;
	private authBaseUrl: string;

	// We no longer manage accessToken/tokenExpiry directly in this class's state
	// They are passed into methods or managed by the caller (tRPC procedure)

	constructor(config: {
		clientId: string;
		clientSecret: string;
		apiKey: string;
	}) {
		if (!config.clientId || !config.clientSecret || !config.apiKey) {
			throw new Error(
				"Investec client requires clientId, clientSecret, and apiKey."
			);
		}
		this.clientId = config.clientId;
		this.clientSecret = config.clientSecret;
		this.apiKey = config.apiKey;
		this.apiBaseUrl = env.INVESTEC_HOST;
		this.authBaseUrl =
			"https://openapisandbox.investec.com/identity/v2/oauth2/token";
	}

	/**
	 * Acquires a new access token using the client_credentials grant type.
	 * @returns {Promise<{ accessToken: string, expiresIn: Date }>}
	 */
	async acquireNewAccessToken(): Promise<{
		accessToken: string;
		expiresIn: Date;
	}> {
		try {
			const authHeader = btoa(`${this.clientId}:${this.clientSecret}`);

			const { access_token, expires_in } = await authenticateWithInvestec(
				this.clientId,
				this.clientSecret,
				this.apiKey
			);
			// 	access_token: string;
			// 	expires_in: number;
			// }>(
			// 	this.authBaseUrl,
			// 	new URLSearchParams({
			// 		grant_type: "client_credentials",
			// 	}).toString(),
			// 	{
			// 		headers: {
			// 			"Content-Type": "application/x-www-form-urlencoded",
			// 			Authorization: `Basic ${authHeader}`,
			// 		},
			// 	}
			// );

			return {
				accessToken: access_token,
				expiresIn: new Date(Date.now() + expires_in * 1000),
			};
		} catch (error) {
			console.error("Error acquiring Investec access token:", error);
			throw new Error(
				"Failed to acquire Investec access token. Please check your credentials."
			);
		}
	}

	/**
	 * Makes an authenticated API request to Investec.
	 * Handles token refreshing if needed by communicating with the caller.
	 * @param {string} currentAccessToken - The currently valid access token from DB.
	 * @param {Date | null} currentTokenExpiry - The current token expiry from DB.
	 * @param {string} endpoint - The API endpoint.
	 * @param {object} options - Fetch options.
	 * @returns {Promise<object>} The JSON response.
	 */
	async makeAuthenticatedRequest(
		currentAccessToken: string | null,
		currentTokenExpiry: Date | null,
		endpoint: string,
		searchParams?: { [key: string]: string }
	): Promise<any> {
		let accessTokenToUse = currentAccessToken;

		// Check token validity and refresh if needed
		if (
			!accessTokenToUse ||
			!currentTokenExpiry ||
			currentTokenExpiry.getTime() <= Date.now() + 60 * 1000
		) {
			// Refresh if expired or expiring within 60 seconds
			console.log(
				"Investec token expired or close to expiry, acquiring new one..."
			);

			const { accessToken: newAccessToken, expiresIn } =
				await this.acquireNewAccessToken();

			accessTokenToUse = newAccessToken;
			// IMPORTANT: The caller (tRPC procedure) needs to update the DB with this new token/expiry
			throw new TokenRefreshNeededError(newAccessToken, expiresIn);
		}

		const url = `${this.apiBaseUrl}${endpoint}?${searchParams ?? ""}`;

		console.log("[INVESTEC] API CALL BEING MADE: ", url);

		try {
			const response = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessTokenToUse}`,
				},
			});

			return await response.json();
		} catch (error) {
			console.error("Error making Investec API request:", error);
		}
	}

	// --- Custom Error Classes for explicit handling in tRPC ---
}

// Custom error to signal that the token was refreshed and needs saving
export class TokenRefreshNeededError extends Error {
	newAccessToken: string;
	newExpiry: Date;
	constructor(newAccessToken: string, newExpiry: Date) {
		super("Investec token refreshed and needs to be saved.");
		this.name = "TokenRefreshNeededError";
		this.newAccessToken = newAccessToken;
		this.newExpiry = newExpiry;
	}
}

// Custom error for truly invalid credentials (401/403)
export class InvalidInvestecCredentialsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidInvestecCredentialsError";
	}
}

export default ServerInvestecAPIClient;
