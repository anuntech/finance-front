import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime:
					process.env.NODE_ENV === "production"
						? 60 * 1000 // 1 minute
						: 1000, // 1 second
				gcTime: 1000 * 60 * 60 * 24, // 24 hours
				refetchOnMount: true,
				refetchOnWindowFocus: true,
				refetchOnReconnect: true,
				retry: 5, // 5 times
				retryDelay: 1000 * 10, // 10 seconds
				retryOnMount: true,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
	if (isServer) {
		// Server: always make a new query client
		return makeQueryClient();
	}

	// Browser: make a new query client if we don't already have one
	// This is very important, so we don't re-make a new client if React
	// suspends during the initial render. This may not be needed if we
	// have a suspense boundary BELOW the creation of the query client
	if (!browserQueryClient) browserQueryClient = makeQueryClient();

	return browserQueryClient;
}
