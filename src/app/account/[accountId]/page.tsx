import AccountTransactions from "~/app/_components/transaction";
import Link from "next/link";
import React from "react";
import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { validateInvestecConnection } from "~/server/actions/validate-credentials";

export default async function AccountDetailsPage({
	params,
}: {
	params: Promise<{ accountId: string }>;
}) {
	const session = await auth();

	if (!session || !session.user) return redirect("/");

	if (!(await validateInvestecConnection(session.user.id))) {
		return redirect("/connect");
	}

	const { accountId } = await params;

	const response = await api.investec.getAccountBalance({ accountId });

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
				Error fetching account balance: {response.message}
			</div>
		);
	}

	return (
		<section>
			<div className="container mx-auto my-4">
				<h1 className="text-3xl font-bold mb-4">Account Details</h1>
				{response ? (
					<div className="mb-6 p-4 border rounded-lg shadow-sm flex justify-between items-center">
						<h2 className="text-2xl font-semibold mb-2">Balance</h2>
						<p className="text-xl">
							{response.currency}{" "}
							{response.currentBalance.toFixed(2)}
						</p>
					</div>
				) : (
					<p>Loading account balance...</p>
				)}
				<AccountTransactions accountId={accountId} />
			</div>
		</section>
	);
}
