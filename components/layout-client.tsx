"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";

const queryClient = new QueryClient();

const ClientLayout = ({ children }: { children: ReactNode }) => {
	return (
		<>
			{/* Show a progress bar at the top when navigating between pages */}
			<NextTopLoader showSpinner={false} />

			{/* Content inside app/page.js files  */}
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>

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
