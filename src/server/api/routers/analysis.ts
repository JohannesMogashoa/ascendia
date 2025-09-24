import { createTRPCRouter, protectedProcedure } from "../trpc";

import { get } from "http";
import { z } from "zod";

export const analysisRouter = createTRPCRouter({
	saveAnalysis: protectedProcedure
		.input(
			z.object({
				analysis: z.string().min(1, "Analysis content is required"),
				fromDate: z.string().min(1, "From date is required"),
				toDate: z.string().min(1, "To date is required"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { analysis, fromDate, toDate } = input;

			// Save the analysis to the database
			return await ctx.db.transactionAnalysis.create({
				data: {
					userId,
					analysis: analysis,
					fromDate: fromDate,
					toDate: toDate,
				},
			});
		}),
	getAnalyses: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		return await ctx.db.transactionAnalysis.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
	}),
});
