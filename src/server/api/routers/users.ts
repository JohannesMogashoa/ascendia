import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

import { env } from "~/env";
import { integrationFormSchema } from "~/shared/schemas/integration.schema";
import { z } from "zod";

const authenticateWithInvestec: {
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

export const userRouter = createTRPCRouter({
	getUserById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.user.findUnique({
				where: { id: input.id },
			});
		}),

	updateUserIntegration: protectedProcedure
		.input(integrationFormSchema)
		.mutation(async ({ ctx, input }) => {
			// execute OAuth flow to get access token
			try {
				const tokenResponse = await authenticateWithInvestec(
					input.clientId,
					input.clientSecret,
					input.apiKey
				);

				console.log("Token response:", tokenResponse);

				await ctx.db.investecIntegration.upsert({
					where: { userId: ctx.session.user.id },
					update: {
						clientId: input.clientId,
						clientSecret: input.clientSecret,
						apiKey: input.apiKey,
						accessToken: tokenResponse.access_token,
						expiresIn: tokenResponse.expires_in,
						scope: tokenResponse.scope,
					},
					create: {
						apiKey: input.apiKey,
						clientSecret: input.clientSecret,
						clientId: input.clientId,
						userId: ctx.session.user.id,
						accessToken: tokenResponse.access_token,
						expiresIn: tokenResponse.expires_in,
						scope: tokenResponse.scope,
					},
				});

				await ctx.db.user.update({
					where: { id: ctx.session.user.id },
					data: { isNewUser: false },
				});

				return { success: true, error: null };
			} catch (error) {
				return {
					success: false,
					error: (error as Error).message,
				};
			}
		}),
});
