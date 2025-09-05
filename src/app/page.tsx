import Link from "next/link";
import { SignIn } from "./_components/signin-button";

export default async function Home() {
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
