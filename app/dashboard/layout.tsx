import config from "@/config";
import { authOptions } from "@/libs/next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({
	children,
}: {
	children: ReactNode;
}) {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect(config.auth.loginUrl);
	}

	return <>{children}</>;
}
