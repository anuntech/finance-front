import Footer from "@/components/Footer";
import { Suspense } from "react";
import HeaderBlog from "./_assets/components/HeaderBlog";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default async function LayoutBlog({ children }: { children: any }) {
	return (
		<div>
			<Suspense>
				<HeaderBlog />
			</Suspense>

			<main className="mx-auto min-h-screen max-w-6xl p-8">{children}</main>

			<div className="h-24" />

			<Footer />
		</div>
	);
}
