import { configs } from "@/configs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const middleware = (request: NextRequest) => {
	const cookie = request.cookies.get("next-auth.session-token");

	if (!cookie) {
		return NextResponse.redirect(
			new URL(configs.REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE)
		);
	}

	return NextResponse.next();
};

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
