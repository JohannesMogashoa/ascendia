"use server";

import { api } from "~/trpc/server";

export const getTransactions = async (
	accountId: string,
	fromDate?: string,
	toDate?: string
) => {
	const response = await api.investec.getAccountTransactions({
		accountId,
		fromDate,
		toDate,
	});

	return response;
};
