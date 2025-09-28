import { useEffect, useState } from "react";

import { TRPCError } from "@trpc/server";
import type { Transaction } from "~/sandbox-transactions";
import { getTransactions } from "~/server/actions/transactions";

const useAccountTransaction = (
	accountId: string,
	fromDate: string | null = null,
	toDate: string | null = null
) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	useEffect(() => {
		const fetchAccountTransactions = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await getTransactions(
					accountId,
					fromDate,
					toDate
				);

				if (response instanceof TRPCError) {
					setError(response.message);
					setIsLoading(false);
					return;
				}
				setTransactions(response);
			} catch (err: any) {
				setError(
					err.message ||
						"An error occurred while fetching transactions."
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccountTransactions();
	}, [accountId, fromDate, toDate]);

	return {
		isLoading,
		error,
		transactions,
	};
};

export default useAccountTransaction;
