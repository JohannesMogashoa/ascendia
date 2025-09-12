"use client";

import Link from "next/link";
import React from "react";
import type { Transaction } from "~/sandbox-transactions";
import { api } from "~/trpc/react";
import { formatDateForInput } from "~/shared/utils/formatters";

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

	const { data, isLoading, isError, error } =
		api.investec.getAccountTransactions.useQuery(
			{ accountId: accountId as string },
			{ enabled: !!accountId } // Only run query if accountId is available
		);

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
		<div className="mx-auto p-4 max-w-2/3">
			<Link
				href="/dashboard"
				className="text-indigo-600 hover:underline mb-4 inline-block"
			>
				&larr; Back to Dashboard
			</Link>
			<h1 className="text-2xl font-bold mb-4">
				Transactions for Account: {accountId}
			</h1>
			<form onSubmit={handleSubmit} className="w-full flex gap-3 mb-5">
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
			{transactions && transactions.length > 0 ? (
				<ul className="space-y-2">
					{transactions.map((tx) => (
						<li
							key={tx.uuid}
							className="bg-white shadow-sm rounded-md p-3"
						>
							<p className="font-semibold">{tx.description}</p>
							<p className="text-gray-700">
								Amount: {tx.amount.toFixed(2)}
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
		</div>
	);
};

export default AccountTransactions;
