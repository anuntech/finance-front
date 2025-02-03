import connectMongo from "@/libs/mongoose";
import { authOptions } from "@/libs/next-auth";
import { createCustomerPortal } from "@/libs/stripe";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (session) {
		try {
			await connectMongo();

			const body = await req.json();

			const { id } = session.user;

			const user = await User.findById(id);

			if (!user?.customerId) {
				return NextResponse.json(
					{
						error:
							"You don't have a billing account yet. Make a purchase first.",
					},
					{ status: 400 }
				);
				// biome-ignore lint/style/noUselessElse: <explanation>
			} else if (!body.returnUrl) {
				return NextResponse.json(
					{ error: "Return URL is required" },
					{ status: 400 }
				);
			}

			const stripePortalUrl = await createCustomerPortal({
				customerId: user.customerId,
				returnUrl: body.returnUrl,
			});

			return NextResponse.json({
				url: stripePortalUrl,
			});
		} catch (e) {
			console.error(e);
			return NextResponse.json({ error: e?.message }, { status: 500 });
		}
	} else {
		// Not Signed in
		return NextResponse.json({ error: "Not signed in" }, { status: 401 });
	}
}
