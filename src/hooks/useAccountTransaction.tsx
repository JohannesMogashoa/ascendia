import { useEffect, useState } from "react";

import type { InvestecTransaction } from "investec-api";
import { getTransactions } from "~/server/actions/transactions";

const useAccountTransaction = (
	accountId: string,
	fromDate?: string,
	toDate?: string
) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [transactions, setTransactions] = useState<InvestecTransaction[]>([]);

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

				if (response instanceof Error) {
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
