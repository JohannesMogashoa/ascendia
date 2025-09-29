import "~/styles/globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import TopbarComponent from "./_components/topbar-component";

export const metadata: Metadata = {
	title: "Ascendia",
	description: "Your gateway to seamless finance management with Investec",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const poppins = Poppins({
	weight: ["200", "400", "600", "800"],
	variable: "--font-poppins",
	subsets: ["devanagari", "latin", "latin-ext"],
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${poppins.variable}`}>
			<body>
				<TRPCReactProvider>
					<TopbarComponent />
					<main className="container mx-auto my-4 px-4">
						{children}
					</main>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
