import { CONFIGS } from "@/configs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const middleware = (request: NextRequest) => {
	const cookieName =
		process.env.NODE_ENV === "production"
			? "__Secure-next-auth.session-token"
			: "next-auth.session-token";
	const cookie = request.cookies.get(cookieName);

	if (!cookie) {
		return NextResponse.redirect(
			new URL(CONFIGS.ENVS.REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE)
		);
	}

	const pathname = request.nextUrl.pathname;
	const params = request.nextUrl.searchParams;
	const workspaceId = params.get("workspaceId");

	const redirectUrl = workspaceId
		? new URL(`/transactions?workspaceId=${workspaceId}`, request.url)
		: new URL("/transactions", request.url);

	if (pathname === "/") {
		return NextResponse.redirect(redirectUrl);
	}

	if (process.env.NODE_ENV === "production") {
		return NextResponse.next();
	}

	const token = cookie.value;

	return NextResponse.next({
		headers: {
			token,
		},
	});
};

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
