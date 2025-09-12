"use server";

import ServerInvestecAPIClient from "./investecApiClient";
import { db } from "../db";

export async function validateInvestecConnection(userId: string) {
	const investecIntegration = await db.investecIntegration.findUnique({
		where: { userId },
		select: {
			accessToken: true,
			expiresIn: true,
			clientId: true,
			clientSecret: true,
			apiKey: true,
		},
	});

	if (
		!investecIntegration ||
		!investecIntegration.expiresIn ||
		!investecIntegration.accessToken
	) {
		return false;
	}

	if (investecIntegration.expiresIn.getTime() <= Date.now() + 60 * 1000) {
		const client = new ServerInvestecAPIClient({
			clientId: investecIntegration.clientId,
			clientSecret: investecIntegration.clientSecret,
			apiKey: investecIntegration.apiKey,
		});

		const { accessToken, expiresIn } = await client.acquireNewAccessToken();

		await db.investecIntegration.update({
			where: { userId },
			data: {
				accessToken,
				expiresIn,
			},
		});
	}

	return true;
}
