import { env } from "~/env";

export const authenticateWithInvestec: {
	(clientId: string, clientSecret: string, apiKey: string): Promise<{
		access_token: string;
		token_type: string;
		expires_in: number;
		scope: string;
	}>;
} = async (clientId: string, clientSecret: string, apiKey: string) => {
	const myHeaders = new Headers();
	myHeaders.append("x-api-key", apiKey);

	const creds = `${clientId}:${clientSecret}`;
	const basicAuth = `Basic ${btoa(creds)}`;

	myHeaders.append("Accept", "application/json");
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	myHeaders.append("Authorization", basicAuth);

	const urlencoded = new URLSearchParams();
	urlencoded.append("grant_type", "client_credentials");

	const requestOptions: RequestInit = {
		method: "POST",
		headers: myHeaders,
		body: urlencoded,
	};

	const response = await fetch(
		`${env.INVESTEC_HOST}/identity/v2/oauth2/token`,
		requestOptions
	);
	const data = await response.json();
	return data;
};
