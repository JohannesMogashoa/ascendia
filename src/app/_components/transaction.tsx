"use client";

import Link from "next/link";
import React from "react";
import { api } from "~/trpc/react";

const AccountTransactions = ({ accountId }: { accountId: string }) => {
	const {
		data: transactions,
		isLoading,
		isError,
		error,
	} = api.investec.getAccountTransactions.useQuery(
		{ accountId: accountId as string },
		{ enabled: !!accountId } // Only run query if accountId is available
	);

	if (isLoading) return <div className="p-4">Loading transactions...</div>;
	if (isError)
		return <div className="p-4 text-red-600">Error: {error.message}</div>;

	return (
		<div className="container mx-auto p-4">
			<Link
				href="/dashboard"
				className="text-indigo-600 hover:underline mb-4 inline-block"
			>
				&larr; Back to Dashboard
			</Link>
			<h1 className="text-2xl font-bold mb-4">
				Transactions for Account: {accountId}
			</h1>
			{transactions && transactions.length > 0 ? (
				<ul className="space-y-2">
					{transactions.map((tx) => (
						<li
							key={tx.uuid}
							className="bg-white shadow-sm rounded-md p-3"
						>
							<p className="font-semibold">{tx.description}</p>
							<p className="text-gray-700">
								Amount: {tx.amount.toFixed(2)} {tx.currency}
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
