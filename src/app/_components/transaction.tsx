"use client";

import {
	CreditCardIcon,
	ExclamationCircleIcon,
	EyeIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { formatDateForInput, truncateNumber } from "~/shared/utils/formatters";

import Link from "next/link";
import Markdown from "react-markdown";
import React from "react";
import type { Transaction } from "~/sandbox-transactions";
import { analyseTransactionsWithAI } from "~/server/lib/openai";
import { api } from "~/trpc/react";
import remarkGfm from "remark-gfm";

function AnalysisError({
	message,
	reset,
}: {
	message: string;
	reset: () => void;
}) {
	return (
		<dialog id="analysis_error" className="modal">
			<div className="modal-box">
				<h3 className="font-bold text-lg">ERROR!</h3>
				<p className="py-4">{message}</p>
				<div className="modal-action">
					<form method="dialog">
						{/* if there is a button in form, it will close the modal */}
						<button onClick={reset} className="btn">
							Close
						</button>
					</form>
				</div>
			</div>
		</dialog>
	);
}

function AnalysisModal({
	analysis,
	dateRange,
}: {
	analysis: string;
	dateRange: string;
}) {
	const [saved, setSaved] = React.useState<boolean>(false);

	const saveAnalysisMutation = api.analysis.saveAnalysis.useMutation({
		onSuccess: (data) => {
			console.log("Analysis saved:", data);
			alert("Analysis saved successfully!");
			setSaved(true);
		},
		onError(error, variables, context) {
			console.error("Error saving analysis:", error);
			alert("Failed to save analysis. Please try again.");
		},
	});

	function downloadMarkdown() {
		const blob = new Blob([analysis], {
			type: "text/markdown;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `analysis_${dateRange}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function saveAnalysis() {
		try {
			const fromDate = dateRange.split("_")[0];
			const toDate = dateRange.split("_")[1];

			if (!fromDate || !toDate) {
				alert("Invalid date range. Cannot save analysis.");
				return;
			}

			saveAnalysisMutation.mutateAsync({
				analysis,
				fromDate,
				toDate,
			});
		} catch (error) {
			console.error("Error saving analysis:", error);
			alert("Failed to save analysis. Please try again.");
		}
	}

	return (
		// {/* Open the modal using document.getElementById('ID').showModal() method */}
		// <button className="btn" onClick={()=>document.getElementById('my_modal_1').showModal()}>open modal</button>
		<dialog id="analysis_modal" className="modal py-10">
			<div className="modal-box w-11/12 max-w-5xl">
				<form method="dialog">
					{/* if there is a button in form, it will close the modal */}
					<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
						✕
					</button>
				</form>
				<h3 className="font-bold text-lg text-center mb-5">
					Ascendia Analysis!
				</h3>
				<Markdown remarkPlugins={[remarkGfm]}>{analysis}</Markdown>
				<div className="modal-action">
					<button
						className="btn"
						disabled={saved}
						onClick={() => saveAnalysis()}
					>
						Save Analysis
					</button>
					<button className="btn" onClick={() => downloadMarkdown()}>
						Download Analysis
					</button>
				</div>
			</div>
		</dialog>
	);
}

const AccountTransactions = ({ accountId }: { accountId: string }) => {
	const [fromDate, setFromDate] = React.useState<string>(
		formatDateForInput(
			new Date(new Date().setDate(new Date().getDate() - 30))
		)
	);
	const [toDate, setToDate] = React.useState<string>(
		formatDateForInput(new Date())
	);
	const [transactions, setTransactions] = React.useState<Transaction[]>([]);
	const [aiResponse, setAiResponse] = React.useState<string | null>(null);
	const [aiError, setAiError] = React.useState<string | null>(null);
	const [isAiLoading, setIsAiLoading] = React.useState<boolean>(false);

	const { data, isLoading, isError, error } =
		api.investec.getAccountTransactions.useQuery(
			{ accountId: accountId as string },
			{ enabled: !!accountId } // Only run query if accountId is available
		);

	function reset() {
		setAiError(null);
	}

	async function analyseWithAI() {
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
			console.error("Error analyzing transactions with AI:", error);
			setAiError("Failed to analyze transactions. Please try again.");
			setAiResponse(null);
		} finally {
			setIsAiLoading(false);
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		e.stopPropagation();

		if (!data) return;

		setTransactions(
			data.filter(
				(tx) => tx.postingDate >= fromDate && tx.postingDate <= toDate
			)
		);
	}

	if (isLoading) return <div className="p-4">Loading transactions...</div>;

	if (isError && error)
		return <div className="p-4 text-red-600">Error: {error.message}</div>;

	return (
		<div className="mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">
				Transactions for Account: {truncateNumber(accountId)}
			</h1>
			<section className="flex w-full flex-wrap gap-3 items-center justify-between mb-5">
				<form onSubmit={handleSubmit} className="flex gap-3">
					<input
						type="date"
						name="from"
						className="input w-52"
						value={fromDate}
						onChange={(e) => setFromDate(e.target.value)}
					/>
					<input
						type="date"
						name="to"
						className="input w-52"
						value={toDate}
						onChange={(e) => setToDate(e.target.value)}
					/>
					<button
						aria-label="Fetch Transactions"
						className="btn w-24 rounded-full tooltip"
						type="submit"
						data-tip="Fetch Transactions"
					>
						<CreditCardIcon className="h-6 w-6" />
					</button>
				</form>
				{aiError ? (
					<button
						className="btn btn-error rounded-full w-24 tooltip"
						aria-label="View Error"
						data-tip="View Error"
						onClick={() =>
							document
								.getElementById("analysis_error")
								?.showModal()
						}
					>
						<ExclamationCircleIcon className="h-6 w-6" />
					</button>
				) : aiResponse ? (
					<div className="flex gap-3 items-center">
						<button
							className="btn btn-success rounded-full w-24 tooltip"
							data-tip="View Analysis"
							aria-label="View Analysis"
							onClick={() =>
								document
									.getElementById("analysis_modal")
									?.showModal()
							}
						>
							<EyeIcon className="h-6 w-6" />
						</button>
						<button
							className="btn rounded-full w-24 tooltip"
							disabled={isAiLoading}
							data-tip="Re-Analyze with AI"
							aria-label="Re-Analyze with AI"
							onClick={() => analyseWithAI()}
						>
							{isAiLoading ? (
								<progress className="progress w-6"></progress>
							) : (
								<SparklesIcon className="h-6 w-6" />
							)}
						</button>
					</div>
				) : (
					<button
						className="btn rounded-full w-24 tooltip"
						disabled={isAiLoading}
						aria-label="Analyze with AI"
						data-tip="Analyze with AI"
						onClick={() => analyseWithAI()}
					>
						{isAiLoading ? (
							<progress className="progress w-6"></progress>
						) : (
							<SparklesIcon className="h-6 w-6" />
						)}
					</button>
				)}
			</section>
			{transactions && transactions.length > 0 ? (
				<ul className="space-y-2">
					{transactions.map((tx, idx) => (
						<li
							key={idx}
							className="bg-white shadow-sm rounded-md p-3"
						>
							<p className="font-semibold">{tx.description}</p>
							<p className="text-gray-700">
								Amount: R{tx.amount.toFixed(2)}
							</p>
							<p className="text-gray-500 text-sm">
								Date: {tx.postingDate}
							</p>
							{/* Add more transaction details as needed */}
						</li>
					))}
				</ul>
			) : (
				<p>No transactions found for this account.</p>
			)}
			{aiResponse && (
				<AnalysisModal
					analysis={aiResponse}
					dateRange={`${fromDate}_${toDate}`}
				/>
			)}
			{aiError && <AnalysisError message={aiError} reset={reset} />}
		</div>
	);
};

export default AccountTransactions;
