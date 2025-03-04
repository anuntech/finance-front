/* eslint-disable @next/next/no-img-element */
"use client";

import apiClient from "@/libs/api";
import { Popover, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

// A button to show user some account actions
//  1. Billing: open a Stripe Customer Portal to manage their billing (cancel subscription, update payment method, etc.).
//     You have to manually activate the Customer Portal in your Stripe Dashboard (https://dashboard.stripe.com/test/settings/billing/portal)
//     This is only available if the customer has a customerId (they made a purchase previously)
//  2. Logout: sign out and go back to homepage
// See more at https://shipfa.st/docs/components/buttonAccount
const ButtonAccount = () => {
	const { data: session, status } = useSession();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleSignOut = () => {
		signOut({ callbackUrl: "/" });
	};
	const handleBilling = async () => {
		setIsLoading(true);

		try {
			const { url }: { url: string } = await apiClient.post(
				"/stripe/create-portal",
				{
					returnUrl: window.location.href,
				}
			);

			window.location.href = url;
		} catch (e) {
			console.error(e);
		}

		setIsLoading(false);
	};

	// Don't show anything if not authenticated (we don't have any info about the user)
	if (status === "unauthenticated") return null;

	return (
		<Popover className="relative z-10">
			{({ open }) => (
				<>
					<Popover.Button className="btn">
						{session?.user?.image ? (
							<img
								src={session?.user?.image}
								alt={session?.user?.name || "Account"}
								className="h-6 w-6 shrink-0 rounded-full"
								referrerPolicy="no-referrer"
								width={24}
								height={24}
							/>
						) : (
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-base-300">
								{session?.user?.name?.charAt(0) ||
									session?.user?.email?.charAt(0)}
							</span>
						)}

						{session?.user?.name || "Account"}

						{isLoading ? (
							// biome-ignore lint/style/useSelfClosingElements: <explanation>
							<span className="loading loading-spinner loading-xs"></span>
						) : (
							// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className={`h-5 w-5 opacity-50 duration-200 ${
									open ? "rotate-180 transform " : ""
								}`}
							>
								<path
									fillRule="evenodd"
									d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
									clipRule="evenodd"
								/>
							</svg>
						)}
					</Popover.Button>
					<Transition
						enter="transition duration-100 ease-out"
						enterFrom="transform scale-95 opacity-0"
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-75 ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-95 opacity-0"
					>
						<Popover.Panel className="absolute left-0 z-10 mt-3 w-screen max-w-[16rem] transform">
							<div className="overflow-hidden rounded-xl bg-base-100 p-1 shadow-xl ring-1 ring-base-content ring-opacity-5">
								<div className="space-y-0.5 text-sm">
									{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
									<button
										className="flex w-full items-center gap-2 rounded-lg px-4 py-1.5 font-medium duration-200 hover:bg-base-300"
										onClick={handleBilling}
									>
										{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="h-5 w-5"
										>
											<path
												fillRule="evenodd"
												d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z"
												clipRule="evenodd"
											/>
										</svg>
										Billing
									</button>
									{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
									<button
										className="flex w-full items-center gap-2 rounded-lg px-4 py-1.5 font-medium duration-200 hover:bg-error/20 hover:text-error"
										onClick={handleSignOut}
									>
										{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="h-5 w-5"
										>
											<path
												fillRule="evenodd"
												d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
												clipRule="evenodd"
											/>
											<path
												fillRule="evenodd"
												d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
												clipRule="evenodd"
											/>
										</svg>
										Logout
									</button>
								</div>
							</div>
						</Popover.Panel>
					</Transition>
				</>
			)}
		</Popover>
	);
};

export default ButtonAccount;
