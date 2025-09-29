import OnboardUserComponent from "../_components/onboard-user";
import React from "react";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function ConnectPage() {
	const session = await auth();

	if (!session || !session.user) return redirect("/");

	return (
		<section className="flex items-center justify-center">
			<OnboardUserComponent />
		</section>
	);
}
