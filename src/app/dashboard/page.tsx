import Link from "next/link";
import React from "react";
import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { validateInvestecConnection } from "~/server/lib/investec-auth";

export default async function DashboardPage() {
	const session = await auth();

	if (!session || !session.user) {
		redirect("/");
	}

	if (!(await validateInvestecConnection(session.user.id))) {
		redirect("/connect");
	}

	const response = await api.investec.getAccounts();

	if (response instanceof TRPCError) {
		if (
			response.code === "UNAUTHORIZED" &&
			response.message.includes("credentials")
		) {
			return (
				<div className="p-4 text-red-600">
					<p>Error: {response.message}</p>
					<p className="mt-2">
						Please{" "}
						<Link
							href="/connect"
							className="text-indigo-600 hover:underline"
						>
							re-connect your Investec account
						</Link>
						.
					</p>
				</div>
			);
		}
		return (
			<div className="p-4 text-red-600">
				Error fetching accounts: {response.message}
			</div>
		);
	}

	if (!response || response.length === 0) {
		return (
			<div className="flex flex-col w-screen h-screen justify-center items-center">
				<p>
					No Investec accounts found. Have you connected your account?
				</p>
				<Link href="/connect" className="btn w-64 rounded-full mt-3">
					Connect Investec Account
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Your Investec Accounts</h1>
			<ul className="space-y-2">
				{response.map((account) => (
					<li
						key={account.accountId}
						className="bg-white shadow-md rounded-lg p-4"
					>
						<h2 className="text-xl font-semibold">
							{account.productName}
						</h2>
						<p className="text-gray-700">
							Account Number: {account.accountNumber}
						</p>
						<p className="text-gray-700">
							Reference: {account.referenceName}
						</p>
						<Link
							href={`/account/${account.accountId}`}
							className="mt-3 inline-block text-indigo-600 hover:underline"
						>
							View Transactions
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
