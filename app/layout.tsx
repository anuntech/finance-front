import ClientLayout from "@/components/layout-client";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import type { Viewport } from "next";
import PlausibleProvider from "next-plausible";
import { Inter } from "next/font/google";
import { type ReactNode, Suspense } from "react";
import "./globals.css";
import { LoadingApp } from "@/components/loading-app";
import { cookies, headers } from "next/headers";

const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	colorScheme: "light",
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default async function RootLayout({
	children,
}: { children: ReactNode }) {
	let token: null | string = null;

	if (process.env.NODE_ENV === "development") {
		const requestHeaders = await headers();

		token = requestHeaders.get("token");
	}

	return (
		<html lang="pt-BR" data-theme="light" className={font.className}>
			{config.domainName && (
				<head>
					<PlausibleProvider domain={config.domainName} />
				</head>
			)}
			<body>
				<Suspense fallback={<LoadingApp />}>
					{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
					<ClientLayout token={token}>{children}</ClientLayout>
				</Suspense>
			</body>
		</html>
	);
}
