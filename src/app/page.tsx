import Link from "next/link";
import { SignIn } from "./_components/signin-button";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();

	if (session && session.user) return redirect("/dashboard");

	return (
		<section className="flex flex-col justify-center items-center h-screen w-screen">
			<header>
				<h1>Welcome to Ascendia</h1>
			</header>
			<section className="flex flex-col gap-5 items-center">
				<p>
					Your gateway to seamless finance management the fun away..
				</p>
				<SignIn />
			</section>
		</section>
	);
}
