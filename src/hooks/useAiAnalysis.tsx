import type { Transaction } from "~/sandbox-transactions";
import { analyseTransactionsWithAI } from "~/server/actions/openai";
import { useState } from "react";

const useAiAnalysis = () => {
	const [aiResponse, setAiResponse] = useState<string | null>(null);
	const [aiError, setAiError] = useState<string | null>(null);
	const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

	const reset = () => {
		setAiError(null);
		setAiResponse(null);
	};

	const analyseWithAI = async (
		transactions: Transaction[],
		fromDate: string,
		toDate: string
	) => {
		try {
			setIsAiLoading(true);
			var response = await analyseTransactionsWithAI(
				transactions,
				fromDate,
				toDate
			);

			if (response.error) {
				setAiError(response.error);
				setAiResponse(null);
			} else {
				setAiResponse(response.data);
				setAiError(null);
			}
		} catch (error) {
			setAiError("Failed to analyze transactions. Please try again.");
			setAiResponse(null);
		} finally {
			setIsAiLoading(false);
		}
	};

	return {
		aiResponse,
		aiError,
		isAiLoading,
		analyseWithAI,
		reset,
	};
};

export default useAiAnalysis;
