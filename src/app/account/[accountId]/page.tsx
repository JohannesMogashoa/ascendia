import AccountTransactions from "~/app/_components/transaction";
import Link from "next/link";
import React from "react";

export default async function AccountDetailsPage({
	params,
}: {
	params: Promise<{ accountId: string }>;
}) {
	const { accountId } = await params;

	return <AccountTransactions accountId={accountId} />;
}
