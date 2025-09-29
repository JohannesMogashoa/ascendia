import {
	Account,
	Client,
	type InvestecAccountBalance,
	type InvestecTransaction,
} from "investec-api";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { authenticateWithInvestec } from "~/server/lib/investec-auth";
import { encrypt, decrypt } from "~/shared/utils/crypto";

export const investecRouter = createTRPCRouter({
	//#region Connect Endpoint

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
				const { access_token, expires_in } =
					await authenticateWithInvestec(
						clientId,
						clientSecret,
						apiKey
					);

				console.log(access_token);

				if (access_token && expires_in) {
					const encryptedClientId = encrypt(clientId);
					const encryptedClientSecret = encrypt(clientSecret);
					const encryptedApiKey = encrypt(apiKey);

					console.log("Encrypted Client ID:", encryptedClientId);
					console.log("Encrypted Secret:", encryptedClientSecret);
					console.log("Encrypted API Key:", encryptedApiKey);

					await ctx.db.investecIntegration.upsert({
						where: { userId: userId },
						create: {
							clientId: encryptedClientId,
							clientSecret: encryptedClientSecret,
							apiKey: encryptedApiKey,
							userId: userId,
						},
						update: {
							clientId: encryptedClientId,
							clientSecret: encryptedClientSecret,
							apiKey: encryptedApiKey,
						},
					});

					return {
						success: true,
						message: "Investec connection established.",
					};
				}

				return {
					success: false,
					message:
						"Failed to connect to Investec. Please check your credentials.",
				};
			} catch (error) {
				console.log(error);
				return {
					success: false,
					message:
						error instanceof Error
							? error.message
							: "An unknown error occurred",
				};
			}
		}),

	//#endregion

	//#region Get Accounts Endpoint
	getAccounts: protectedProcedure.query(
		async ({ ctx }): Promise<Account[] | Error> => {
			const userId = ctx.session.user.id;

			try {
				const integration = await ctx.db.investecIntegration.findUnique(
					{
						where: { userId: userId },
						select: {
							clientId: true,
							clientSecret: true,
							apiKey: true,
						},
					}
				);

				if (
					!integration?.clientId ||
					!integration?.clientSecret ||
					!integration?.apiKey
				) {
					return new Error(
						"Investec credentials not found. Please connect your account."
					);
				}

				const clientId = decrypt(integration.clientId);
				const clientSecret = decrypt(integration.clientSecret);
				const apiKey = decrypt(integration.apiKey);

				if (!clientId || !clientSecret || !apiKey) {
					return new Error(
						"Failed to decrypt integration information"
					);
				}

				const client = await Client.create(
					clientId,
					clientSecret,
					apiKey
				);

				const accounts = await client.getAccounts();

				return accounts;
			} catch (error) {
				return new Error("Failed to retrieve Investec accounts.");
			}
		}
	),
	//#endregion

	//#region Get Account Balance
	getAccountBalance: protectedProcedure
		.input(
			z.object({
				accountId: z.string().min(1, "Account ID is required"),
			})
		)
		.query(
			async ({ ctx, input }): Promise<InvestecAccountBalance | Error> => {
				const userId = ctx.session.user.id;
				const { accountId } = input;

				try {
					const integration =
						await ctx.db.investecIntegration.findUnique({
							where: { userId: userId },
							select: {
								clientId: true,
								clientSecret: true,
								apiKey: true,
							},
						});

					if (
						!integration?.clientId ||
						!integration?.clientSecret ||
						!integration?.apiKey
					) {
						return new Error(
							"Investec credentials not found. Please connect your account."
						);
					}

					const clientId = decrypt(integration.clientId);
					const clientSecret = decrypt(integration.clientSecret);
					const apiKey = decrypt(integration.apiKey);

					if (!clientId || !clientSecret || !apiKey) {
						return new Error(
							"Failed to decrypt integration information"
						);
					}

					const client = await Client.create(
						clientId,
						clientSecret,
						apiKey
					);

					const accounts = await client.getAccounts();

					const account = accounts.find(
						(a) => a.accountId === accountId
					);

					const balance = await account?.getBalance();
					if (!balance) {
						return new Error(
							`Failed to retrieve account balance for: ${accountId}`
						);
					}

					return balance;
				} catch (error) {
					return new Error("Failed to retrieve Investec accounts.");
				}
			}
		),
	//#endregion

	//#region Get Account Transactions
	getAccountTransactions: protectedProcedure
		.input(
			z.object({
				accountId: z.string().min(1, "Account ID is required"),
				fromDate: z.string().optional(), // YYYY-MM-DD
				toDate: z.string().optional(), // YYYY-MM-DD
			})
		)
		.query(
			async ({ ctx, input }): Promise<InvestecTransaction[] | Error> => {
				const userId = ctx.session.user.id;
				const { accountId, fromDate, toDate } = input;

				try {
					const integration =
						await ctx.db.investecIntegration.findUnique({
							where: { userId: userId },
							select: {
								clientId: true,
								clientSecret: true,
								apiKey: true,
							},
						});

					if (
						!integration?.clientId ||
						!integration?.clientSecret ||
						!integration?.apiKey
					) {
						return new Error(
							"Investec credentials not found. Please connect your account."
						);
					}

					const clientId = decrypt(integration.clientId);
					const clientSecret = decrypt(integration.clientSecret);
					const apiKey = decrypt(integration.apiKey);

					if (!clientId || !clientSecret || !apiKey) {
						return new Error(
							"Failed to decrypt integration information"
						);
					}

					const client = await Client.create(
						clientId,
						clientSecret,
						apiKey
					);

					const accounts = await client.getAccounts();

					const account = accounts.find(
						(a) => a.accountId === accountId
					);

					const trans = await account?.getTransactions({
						fromDate: fromDate,
						toDate: toDate,
					});

					if (!trans)
						return new Error(
							`No transactions found for this account: ${accountId}`
						);

					return trans;
				} catch (error) {
					return new Error(
						"Failed to retrieve Investec transactions."
					);
				}
			}
		),
	//#endregion
});
