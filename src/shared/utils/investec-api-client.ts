/**
 * A JavaScript client for interacting with the Investec Programmable Banking APIs.
 * Handles client_credentials authentication and provides methods for account-related operations.
 */
class InvestecAPIClient {
	_clientId: string | null;
	_clientSecret: string | null;
	_apiKey: string | null;
	apiBaseUrl: string;
	authBaseUrl: string;
	accessToken: string | null;
	tokenExpiry: number | null;

	constructor() {
		// These properties will be set AFTER the user provides them
		this._clientId = null;
		this._clientSecret = null;
		this._apiKey = null; // New: for x-api-key header

		this.apiBaseUrl = "https://open-api.investec.com/za/pb";
		this.authBaseUrl = "https://oauth2.investec.com/oauth/token";

		this.accessToken = null;
		this.tokenExpiry = null; // Timestamp when token expires
		// No refresh token needed with client_credentials flow as per current docs
	}

	/**
	 * Initializes the client with user-provided credentials.
	 * This effectively "instantiates" the client for a specific user's credentials.
	 * @param {string} clientId - The user's Investec Developer App Client ID.
	 * @param {string} clientSecret - The user's Investec Developer App Client Secret.
	 * @param {string} apiKey - The user's Investec Developer App API Key (for x-api-key header).
	 */
	async initialize({
		clientId,
		clientSecret,
		apiKey,
	}: {
		clientId: string;
		clientSecret: string;
		apiKey: string;
	}) {
		if (!clientId || !clientSecret || !apiKey) {
			throw new Error(
				"clientId, clientSecret, and apiKey are required to initialize the client."
			);
		}
		this._clientId = clientId;
		this._clientSecret = clientSecret;
		this._apiKey = apiKey;

		// Attempt to load tokens from storage if already authenticated
		this.loadTokens();

		// If no token or expired, try to get a new one immediately
		if (
			!this.accessToken ||
			(this.tokenExpiry && Date.now() >= this.tokenExpiry)
		) {
			console.log(
				"No valid token on initialize. Attempting to acquire new token..."
			);
			await this.acquireNewAccessToken();
		}
	}

	/**
	 * Acquires a new access token using the client_credentials grant type.
	 * This replaces the exchangeCodeForTokens and refreshAccessToken logic.
	 * @returns {Promise<boolean>} True if token was successfully acquired/refreshed, false otherwise.
	 */
	async acquireNewAccessToken() {
		if (!this._clientId || !this._clientSecret) {
			console.error(
				"Client not initialized with clientId and clientSecret."
			);
			return false;
		}

		try {
			const authHeader = btoa(`${this._clientId}:${this._clientSecret}`); // Base64 encode client_id:client_secret

			const response = await fetch(this.authBaseUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${authHeader}`,
				},
				body: new URLSearchParams({
					grant_type: "client_credentials",
					scope: "accounts transactions", // Define your required scopes here
				}).toString(),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Token acquisition failed:", errorData);
				throw new Error(
					`Failed to acquire token: ${
						errorData.error_description || response.statusText
					}`
				);
			}

			const data = await response.json();
			// Client credentials grant does not typically return a refresh token
			this._setAccessToken(data.access_token, data.expires_in);
			console.log("New access token acquired successfully.");
			return true;
		} catch (error) {
			console.error("Error acquiring new access token:", error);
			this.clearTokens(); // Clear tokens if acquisition fails
			throw error; // Propagate error for UI feedback
		}
	}

	/**
	 * Stores the access token and sets its expiry.
	 * @param {string} accessToken
	 * @param {number} expiresIn - Time in seconds until the access token expires.
	 */
	_setAccessToken(accessToken: string, expiresIn: number) {
		this.accessToken = accessToken;
		this.tokenExpiry = expiresIn; // in seconds
		console.log(
			"Access token set. Expires at:",
			new Date(this.tokenExpiry)
		);

		// For hackathon, storing in localStorage. For production, use secure storage.
		localStorage.setItem("investec_access_token", accessToken);
		localStorage.setItem(
			"investec_token_expiry",
			this.tokenExpiry.toString()
		);
		// Also persist the client-specific credentials
		localStorage.setItem("investec_client_id", this._clientId!);
		localStorage.setItem("investec_client_secret", this._clientSecret!);
		localStorage.setItem("investec_api_key", this._apiKey!);
	}

	/**
	 * Loads credentials and tokens from storage.
	 */
	loadTokens() {
		this._clientId = localStorage.getItem("investec_client_id");
		this._clientSecret = localStorage.getItem("investec_client_secret");
		this._apiKey = localStorage.getItem("investec_api_key");
		this.accessToken = localStorage.getItem("investec_access_token");
		this.tokenExpiry = parseInt(
			localStorage.getItem("investec_token_expiry") ?? "1799",
			10
		);

		console.log(
			"Loaded credentials and tokens from storage. Client ID present:",
			!!this._clientId
		);
		console.log("Access Token present:", !!this.accessToken);
	}

	/**
	 * Clears all stored credentials and tokens.
	 */
	clearTokens() {
		this._clientId = null;
		this._clientSecret = null;
		this._apiKey = null;
		this.accessToken = null;
		this.tokenExpiry = null;
		localStorage.removeItem("investec_client_id");
		localStorage.removeItem("investec_client_secret");
		localStorage.removeItem("investec_api_key");
		localStorage.removeItem("investec_access_token");
		localStorage.removeItem("investec_token_expiry");
		console.log("All Investec credentials and tokens cleared.");
	}

	/**
	 * Checks if the access token is valid and not expired,
	 * attempting to acquire a new one if necessary.
	 * @returns {Promise<boolean>} True if a valid access token is available, false otherwise.
	 */
	async ensureAuthenticated() {
		if (!this._clientId || !this._clientSecret || !this._apiKey) {
			console.warn(
				"Client not initialized. Cannot ensure authentication."
			);
			return false;
		}

		if (
			!this.accessToken ||
			(this.tokenExpiry && Date.now() >= this.tokenExpiry)
		) {
			console.log(
				"Access token expired or missing. Attempting to acquire new token..."
			);
			try {
				return await this.acquireNewAccessToken();
			} catch (error) {
				console.error(
					"Failed to acquire new token during ensureAuthenticated:",
					error
				);
				return false;
			}
		}
		return true; // Token is still valid
	}

	/**
	 * Generic private method to make authenticated API requests.
	 * Handles token refreshing if needed.
	 * @param {string} endpoint - The API endpoint relative to apiBaseUrl.
	 * @param {object} options - Fetch API options (method, headers, body, etc.).
	 * @returns {Promise<object>} The JSON response from the API.
	 */
	async _request(endpoint: string, options = {} as any) {
		if (!(await this.ensureAuthenticated())) {
			throw new Error(
				"Client not authenticated. Please provide credentials."
			);
		}

		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.accessToken}`,
			"x-api-key": this._apiKey, // NEW: x-api-key header
			...options.headers,
		};

		const url = `${this.apiBaseUrl}${endpoint}`;

		try {
			const response = await fetch(url, { ...options, headers });

			if (response.status === 401 || response.status === 403) {
				// Token or API Key might have become invalid.
				console.warn(
					"API returned 401/403. Credentials might be invalid. Clearing tokens and credentials."
				);
				this.clearTokens();
				throw new Error(
					"Authentication failed. Please re-enter your Investec credentials."
				);
			}

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error(
					`API request to ${endpoint} failed:`,
					response.status,
					response.statusText,
					errorData
				);
				throw new Error(
					`API Error: ${response.statusText} - ${
						errorData.message || JSON.stringify(errorData)
					}`
				);
			}

			return response.json();
		} catch (error) {
			console.error(`Error making API request to ${endpoint}:`, error);
			throw error;
		}
	}

	// --- ACCOUNT ENDPOINTS (Remain largely the same) ---

	async getAccounts() {
		console.log("Fetching all accounts...");
		const response = await this._request("/v2/accounts");
		return response.data.accounts;
	}

	async getAccount(accountId: string) {
		if (!accountId)
			throw new Error("accountId is required to get a specific account.");
		console.log(`Fetching account details for ID: ${accountId}...`);
		const response = await this._request(`/v2/accounts/${accountId}`);
		return response.data.account;
	}

	async getAccountTransactions(accountId: string, params = {}) {
		if (!accountId)
			throw new Error(
				"accountId is required to get account transactions."
			);
		console.log(`Fetching transactions for account ID: ${accountId}...`);

		const queryString = new URLSearchParams(params).toString();
		const endpoint = `/v2/accounts/${accountId}/transactions${
			queryString ? `?${queryString}` : ""
		}`;
		const response = await this._request(endpoint);
		return response.data.transactions;
	}

	// --- Other useful endpoints ---

	async transferFunds(
		fromAccountId: string,
		toAccountId: string,
		amount: string,
		statementReference: string
	) {
		if (!fromAccountId || !toAccountId || !amount || !statementReference) {
			throw new Error("All transfer parameters are required.");
		}
		console.log(
			`Initiating transfer from ${fromAccountId} to ${toAccountId} of ${amount}...`
		);
		const body = {
			fromAccountId,
			toAccountId,
			amount,
			statementReference,
		};
		const response = await this._request(
			`/v2/accounts/${fromAccountId}/transactions/transfer`,
			{
				method: "POST",
				body: JSON.stringify(body),
			}
		);
		return response;
	}

	async getAccountBeneficiaries(accountId: string) {
		if (!accountId)
			throw new Error("accountId is required to get beneficiaries.");
		console.log(`Fetching beneficiaries for account ID: ${accountId}...`);
		// Confirm the exact endpoint path from the Postman collection or docs!
		const response = await this._request(
			`/v2/accounts/${accountId}/beneficiaries`
		);
		return response.data.beneficiaries;
	}
}

export default InvestecAPIClient;
