import ServerInvestecAPIClient, {
	InvalidInvestecCredentialsError,
	TokenRefreshNeededError,
} from "../../lib/investecApiClient";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
// src/server/api/routers/investec.ts
import { z } from "zod";

export const investecRouter = createTRPCRouter({
	// 1. Procedure to save user's Investec credentials and perform initial connection test
	connect: protectedProcedure
		.input(
			z.object({
				clientId: z.string().min(1, "Client ID is required"),
				clientSecret: z.string().min(1, "Client Secret is required"),
				apiKey: z.string().min(1, "API Key is required"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { clientId, clientSecret, apiKey } = input;

			try {
				// Instantiate client with user's provided credentials
				const investecClient = new ServerInvestecAPIClient({
					clientId,
					clientSecret,
					apiKey,
				});

				// Perform initial token acquisition to test credentials
				const { accessToken, expiresIn } =
					await investecClient.acquireNewAccessToken();

				const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

				// Persist credentials and tokens to the database
				await ctx.db.investecIntegration.upsert({
					where: { userId: userId },
					create: {
						clientId: clientId,
						clientSecret: clientSecret,
						apiKey: apiKey,
						accessToken: accessToken,
						expiresIn: tokenExpiry,
						userId: userId,
					},
					update: {
						clientId: clientId,
						clientSecret: clientSecret,
						apiKey: apiKey,
						accessToken: accessToken,
						expiresIn: tokenExpiry,
					},
				});

				return {
					success: true,
					message: "Investec connection established.",
				};
			} catch (error) {
				console.error(
					"Investec connection failed for user",
					userId,
					error
				);
				return new TRPCError({
					code: "BAD_REQUEST",
					message:
						error instanceof InvalidInvestecCredentialsError
							? error.message
							: "Failed to connect to Investec. Please check your credentials.",
					cause: error,
				});
			}
		}),

	// 2. Procedure to get Investec accounts
	getAccounts: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Retrieve user's Investec credentials and current token from the database
		const integration = await ctx.db.investecIntegration.findUnique({
			where: { userId: userId },
			select: {
				clientId: true,
				clientSecret: true,
				apiKey: true,
				accessToken: true,
				expiresIn: true,
			},
		});

		if (
			!integration?.clientId ||
			!integration?.clientSecret ||
			!integration?.apiKey
		) {
			return new TRPCError({
				code: "UNAUTHORIZED",
				message:
					"Investec credentials not found. Please connect your account.",
			});
		}

		try {
			const investecClient = new ServerInvestecAPIClient({
				clientId: integration.clientId,
				clientSecret: integration.clientSecret,
				apiKey: integration.apiKey,
			});

			// Attempt to make request, token refresh handled internally by the client
			const response = await investecClient.makeAuthenticatedRequest(
				integration.accessToken,
				integration.expiresIn,
				"/za/pb/v1/accounts"
			);

			return response.data.accounts; // Assuming Investec response structure
		} catch (error) {
			// Handle token refresh: if TokenRefreshNeededError is thrown, update DB and re-request
			if (error instanceof TokenRefreshNeededError) {
				await ctx.db.investecIntegration.update({
					where: { userId: userId },
					data: {
						accessToken: error.newAccessToken,
						expiresIn: error.newExpiry,
					},
				});
				// Now that tokens are updated, retry the request
				const investecClient = new ServerInvestecAPIClient({
					// Re-instantiate with new token for clarity
					clientId: integration.clientId,
					clientSecret: integration.clientSecret,
					apiKey: integration.apiKey,
				});

				const accountsData =
					await investecClient.makeAuthenticatedRequest(
						error.newAccessToken, // Use the newly acquired token
						error.newExpiry, // Use the newly acquired expiry
						"/za/pb/v1/accounts"
					);
				return accountsData.data.accounts;
			}

			// Handle invalid credentials
			if (error instanceof InvalidInvestecCredentialsError) {
				// Clear stored credentials if they are permanently invalid
				await ctx.db.investecIntegration.update({
					where: { userId: userId },
					data: {
						accessToken: null,
						expiresIn: null,
					},
				});
				return new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Your Investec credentials are no longer valid. Please re-connect your account.",
					cause: error,
				});
			}

			console.error(
				"Failed to fetch Investec accounts for user",
				userId,
				error
			);

			return new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to retrieve Investec accounts.",
				cause: error,
			});
		}
	}),

	// 3. Procedure to get Investec account transactions
	getAccountTransactions: protectedProcedure
		.input(
			z.object({
				accountId: z.string().min(1, "Account ID is required"),
				fromDate: z.string().optional(), // YYYY-MM-DD
				toDate: z.string().optional(), // YYYY-MM-DD
			})
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { accountId, fromDate, toDate } = input;

			const integration = await ctx.db.investecIntegration.findUnique({
				where: { userId: userId },
				select: {
					clientId: true,
					clientSecret: true,
					apiKey: true,
					accessToken: true,
					expiresIn: true,
				},
			});

			if (
				!integration?.clientId ||
				!integration?.clientSecret ||
				!integration?.apiKey
			) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message:
						"Investec credentials not found. Please connect your account.",
				});
			}

			try {
				const investecClient = new ServerInvestecAPIClient({
					clientId: integration.clientId,
					clientSecret: integration.clientSecret,
					apiKey: integration.apiKey,
				});

				const params: { [key: string]: string } = {};
				if (fromDate) params.fromDate = fromDate;
				if (toDate) params.toDate = toDate;

				const transactionsData =
					await investecClient.makeAuthenticatedRequest(
						integration.accessToken,
						integration.expiresIn,
						`/za/pb/v1/accounts/${accountId}/transactions`,
						{
							params: new URLSearchParams(params).toString(), // Not directly supported by fetch, will be appended by _request if present
						}
					);

				return transactionsData.data.transactions;
			} catch (error) {
				// Handle TokenRefreshNeededError similarly to getAccounts
				if (error instanceof TokenRefreshNeededError) {
					await ctx.db.investecIntegration.update({
						where: { id: userId },
						data: {
							accessToken: error.newAccessToken,
							expiresIn: error.newExpiry,
						},
					});
					// Retry the request after saving new token
					const investecClient = new ServerInvestecAPIClient({
						clientId: integration.clientId,
						clientSecret: integration.clientSecret,
						apiKey: integration.apiKey,
					});
					const params: { [key: string]: string } = {};
					if (fromDate) params.fromDate = fromDate;
					if (toDate) params.toDate = toDate;
					const transactionsData =
						await investecClient.makeAuthenticatedRequest(
							error.newAccessToken,
							error.newExpiry,
							`/v2/accounts/${accountId}/transactions`,
							{
								params: new URLSearchParams(params).toString(),
							}
						);
					return transactionsData.data.transactions;
				}

				if (error instanceof InvalidInvestecCredentialsError) {
					await ctx.db.investecIntegration.update({
						where: { userId: userId },
						data: {
							accessToken: null,
							expiresIn: null,
						},
					});
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"Your Investec credentials are no longer valid. Please re-connect your account.",
						cause: error,
					});
				}
				console.error(
					"Failed to fetch Investec transactions for user",
					userId,
					error
				);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to retrieve Investec transactions.",
					cause: error,
				});
			}
		}),
});
