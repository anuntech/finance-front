"use client";

import { DateTypeProvider } from "@/contexts/date-type";
import { DateWithMonthAndYearProvider } from "@/contexts/date-with-month-and-year";
import { getQueryClient } from "@/utils/get-query-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistQueryClientSubscribe } from "@tanstack/react-query-persist-client";
import { useSearchParams } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { type ReactNode, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";

interface Props {
	token: string | null;
	children: ReactNode;
}

const ClientLayout = ({ children, token }: Props) => {
	const searchParams = useSearchParams();
	const workspaceId = searchParams.get("workspaceId");

	const queryClient = getQueryClient();

	useEffect(() => {
		window.localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");

		// temporary
		if (
			process.env.NODE_ENV === "development" ||
			process.env.NODE_ENV === "production"
		) {
			window.localStorage.removeItem("FINANCE_APP_CACHE");
			window.localStorage.removeItem("ally-supports-cache");
			window.localStorage.removeItem("persist:user");

			return;
		}

		const persister = createSyncStoragePersister({
			storage: window.localStorage,
			key: "FINANCE_APP_CACHE",
		});

		const unsubscribe = persistQueryClientSubscribe({
			// @ts-ignore
			queryClient,
			persister,
			maxAge: 1000 * 60 * 60 * 24, // 24 hours
			dehydrateOptions: {
				shouldDehydrateQuery: query => {
					return query.state.status === "success";
				},
			},
		});

		return () => {
			unsubscribe();
		};
	}, [queryClient]);

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
				<DateWithMonthAndYearProvider>
					<DateTypeProvider>{children}</DateTypeProvider>
				</DateWithMonthAndYearProvider>
				<ReactQueryDevtools />
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
