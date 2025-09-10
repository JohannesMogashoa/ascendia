"use client";

import React from "react";
import trans, { type Transaction } from "~/sandbox-transactions";
import { analyseTransactionsWithAI } from "~/server/lib/openai";
import Markdown from "react-markdown";
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
					<button className="btn" onClick={() => downloadMarkdown()}>
						Download Analysis
					</button>
				</div>
			</div>
		</dialog>
	);
}

export function TransactionsPageComponent() {
	const [fromDate, setFromDate] = React.useState<string>("2025-06-01");
	const [toDate, setToDate] = React.useState<string>("2025-06-30");
	const [transactions, setTransactions] = React.useState<Transaction[]>(
		init()
	);
	const [aiResponse, setAiResponse] = React.useState<string | null>(null);
	const [aiError, setAiError] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState<boolean>(false);

	function init() {
		return trans.filter(
			(tx) => tx.postingDate >= fromDate && tx.postingDate <= toDate
		);
	}

	function reset() {
		setAiError(null);
	}

	async function analyseWithAI() {
		try {
			setIsLoading(true);
			var response = await analyseTransactionsWithAI(transactions);

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
			setIsLoading(false);
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		e.stopPropagation();

		const filtered = trans.filter(
			(tx) => tx.postingDate >= fromDate && tx.postingDate <= toDate
		);
		setTransactions(filtered);
	}

	return (
		<section className="p-4">
			<form onSubmit={handleSubmit} className="w-full flex gap-3">
				<input
					type="date"
					name="from"
					className="input"
					value={fromDate}
					onChange={(e) => setFromDate(e.target.value)}
				/>
				<input
					type="date"
					name="to"
					className="input"
					value={toDate}
					onChange={(e) => setToDate(e.target.value)}
				/>
				<button className="btn w-64 rounded-full" type="submit">
					Get Transactions
				</button>
			</form>
			<div className="mt-5">
				<div className="flex justify-between items-center mb-5">
					<h2 className="font-black text-3xl">
						Transactions from {fromDate} to {toDate}
					</h2>
					{aiError ? (
						<button
							className="btn btn-error rounded-full w-64"
							onClick={() =>
								document
									.getElementById("analysis_error")
									?.showModal()
							}
						>
							View Error
						</button>
					) : aiResponse ? (
						<button
							className="btn btn-success rounded-full w-64"
							onClick={() =>
								document
									.getElementById("analysis_modal")
									?.showModal()
							}
						>
							View Analysis
						</button>
					) : (
						<button
							className="btn rounded-full w-64"
							disabled={isLoading}
							onClick={() => analyseWithAI()}
						>
							{isLoading ? "Analyzing..." : "Analyze with AI"}
						</button>
					)}
				</div>
				<ul>
					{transactions.map((tx, index) => (
						<li key={index} className="mb-3 border-2 p-2">
							<p>
								{tx.postingDate}: {tx.description} - R
								{tx.amount}
							</p>
							<p>
								{tx.type}: {tx.transactionType}
							</p>
						</li>
					))}
				</ul>
			</div>
			{aiResponse && (
				<AnalysisModal
					analysis={aiResponse}
					dateRange={`${fromDate}_${toDate}`}
				/>
			)}
			{aiError && <AnalysisError message={aiError} reset={reset} />}
		</section>
	);
}
