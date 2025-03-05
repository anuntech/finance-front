"use client";

import { DateWithMonthAndYearProvider } from "@/contexts/date-with-month-and-year";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { type ReactNode, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";

const queryClient = new QueryClient();

interface Props {
	token: string | null;
	children: ReactNode;
}

const ClientLayout = ({ children, token }: Props) => {
	const searchParams = useSearchParams();
	const workspaceId = searchParams.get("workspaceId");

	useEffect(() => {
		if (workspaceId) {
			localStorage.setItem("workspaceId", workspaceId as string);
		}
	}, [workspaceId]);

	useEffect(() => {
		if (process.env.NODE_ENV === "production") {
			return;
		}

		if (token) {
			localStorage.setItem("token", token);
		}
	}, [token]);

	return (
		<>
			{/* Show a progress bar at the top when navigating between pages */}
			<NextTopLoader showSpinner={false} />

			{/* Content inside app/page.js files  */}
			<QueryClientProvider client={queryClient}>
				<DateWithMonthAndYearProvider>{children}</DateWithMonthAndYearProvider>
			</QueryClientProvider>

			{/* Show Success/Error messages anywhere from the app with toast() */}
			<Toaster
				toastOptions={{
					duration: 3000,
				}}
			/>

			{/* Show tooltips if any JSX elements has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content="" */}
			<Tooltip
				id="tooltip"
				className="!opacity-100 z-[60] max-w-sm shadow-lg"
			/>
		</>
	);
};

export default ClientLayout;
