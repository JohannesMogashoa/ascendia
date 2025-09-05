import { HydrateClient, api } from "~/trpc/server";

import React from "react";
import { auth } from "~/server/auth";

export default async function DashboardPage() {
	const session = await auth();

	if (session?.user) {
		void api.post.getLatest.prefetch();
	}
	return (
		<HydrateClient>
			<h1>Welcome to the dashboard page</h1>
		</HydrateClient>
	);
}
