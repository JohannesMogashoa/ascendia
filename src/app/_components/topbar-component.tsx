import { auth, signOut } from "~/server/auth";

import Link from "next/link";
import React from "react";

const TopbarComponent = async () => {
	const session = await auth();

	let href = "/dashboard";
	let imgUrl =
		"https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

	if (!session) {
		href = "/";
	}

	return (
		<div className="navbar bg-base-100 shadow-sm">
			<div className="flex-1">
				<Link
					href={session ? "/dashboard" : "/"}
					className="btn btn-ghost text-xl"
				>
					Ascendia
				</Link>
			</div>
			{session && (
				<div className="flex-none">
					<div className="dropdown dropdown-end">
						<div
							tabIndex={0}
							role="button"
							className="btn btn-ghost btn-circle avatar"
						>
							<div className="w-10 rounded-full">
								<img
									alt="Tailwind CSS Navbar component"
									src={session?.user.image ?? imgUrl}
								/>
							</div>
						</div>
						<ul
							tabIndex={0}
							className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
						>
							<li>
								<Link href={"/analysis"}>Analysis</Link>
							</li>
							<li>
								<a>Settings</a>
							</li>
							<li>
								<form
									action={async () => {
										"use server";
										await signOut({
											redirectTo: "/",
											redirect: true,
										});
									}}
								>
									<button>Sign out</button>
								</form>
							</li>
						</ul>
					</div>
				</div>
			)}
		</div>
	);
};

export default TopbarComponent;
