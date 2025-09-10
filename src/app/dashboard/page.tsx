import { HydrateClient, api } from "~/trpc/server";

import React from "react";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
	const session = await auth();

	if (session?.user) {
		const user = await api.user.getUserById({
			id: session.user.id,
		});

		if (user?.isNewUser) {
			return redirect("/profile");
		}
	}
	return (
		<HydrateClient>
			<h1>Welcome to the dashboard page</h1>
		</HydrateClient>
	);
}
