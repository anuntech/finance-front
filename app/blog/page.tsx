import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import CardArticle from "./_assets/components/CardArticle";
import CardCategory from "./_assets/components/CardCategory";
import { articles, categories } from "./_assets/content";

export const metadata = getSEOTags({
	title: `${config.appName} Blog | Stripe Chargeback Protection`,
	description:
		"Learn how to prevent chargebacks, how to accept payments online, and keep your Stripe account in good standing",
	canonicalUrlRelative: "/blog",
});

export default async function Blog() {
	const articlesToDisplay = articles
		.sort(
			(a, b) =>
				new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf()
		)
		.slice(0, 6);
	return (
		<>
			<section className="mx-auto mt-12 mb-24 max-w-xl text-center md:mb-32">
				<h1 className="mb-6 font-extrabold text-3xl tracking-tight lg:text-5xl">
					The {config.appName} Blog
				</h1>
				<p className="text-lg leading-relaxed opacity-80">
					Learn how to ship your startup in days, not weeks. And get the latest
					updates about the boilerplate
				</p>
			</section>

			<section className="mb-24 grid gap-8 md:mb-32 lg:grid-cols-2">
				{articlesToDisplay.map((article, i) => (
					<CardArticle
						article={article}
						key={article.slug}
						isImagePriority={i <= 2}
					/>
				))}
			</section>

			<section>
				<p className="mb-8 text-center font-bold text-2xl tracking-tight md:mb-12 lg:text-4xl">
					Browse articles by category
				</p>

				<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
					{categories.map(category => (
						<CardCategory key={category.slug} category={category} tag="div" />
					))}
				</div>
			</section>
		</>
	);
}
