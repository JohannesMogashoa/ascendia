import AccountTransactions from "~/app/_components/transaction";
import React from "react";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { validateInvestecConnection } from "~/server/lib/investec-auth";

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

	return <AccountTransactions accountId={accountId} />;
}
