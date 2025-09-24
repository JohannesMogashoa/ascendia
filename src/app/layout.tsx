import "~/styles/globals.css";

import { Geist } from "next/font/google";
import type { Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import TopbarComponent from "./_components/topbar-component";

export const metadata: Metadata = {
	title: "Ascendia",
	description: "Your gateway to seamless finance management with Investec",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
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
