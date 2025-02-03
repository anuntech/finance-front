import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import Image from "next/image";
import CardArticle from "../../_assets/components/CardArticle";
import { articles, authors } from "../../_assets/content";

export async function generateMetadata({
	params,
}: {
	params: { authorId: string };
}) {
	const author = authors.find(author => author.slug === params.authorId);

	return getSEOTags({
		title: `${author.name}, Author at ${config.appName}'s Blog`,
		description: `${author.name}, Author at ${config.appName}'s Blog`,
		canonicalUrlRelative: `/blog/author/${author.slug}`,
	});
}

export default async function Author({
	params,
}: {
	params: { authorId: string };
}) {
	const author = authors.find(author => author.slug === params.authorId);
	const articlesByAuthor = articles
		.filter(article => article.author.slug === author.slug)
		.sort(
			(a, b) =>
				new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf()
		);

	return (
		<>
			<section className="mx-auto mt-12 mb-24 flex max-w-3xl flex-col gap-8 md:mb-32 md:flex-row">
				<div>
					<p className="mb-2 text-base-content/80 text-xs uppercase tracking-wide">
						Authors
					</p>
					<h1 className="mb-2 font-extrabold text-3xl tracking-tight lg:text-5xl">
						{author.name}
					</h1>
					<p className="mb-6 font-medium md:mb-10 md:text-lg">{author.job}</p>
					<p className="text-base-content/80 md:text-lg">
						{author.description}
					</p>
				</div>

				<div className="flex shrink-0 gap-4 max-md:order-first md:flex-col">
					<Image
						src={author.avatar}
						width={256}
						height={256}
						alt={author.name}
						priority={true}
						className="w-[12rem] rounded-box md:w-[16rem] "
					/>

					{author.socials?.length > 0 && (
						<div className="flex flex-col gap-4 md:flex-row">
							{author.socials.map(social => (
								<a
									key={social.name}
									href={social.url}
									className="btn btn-square"
									// Using a dark theme? -> className="btn btn-square btn-neutral"
									title={`Go to ${author.name} profile on ${social.name}`}
									target="_blank"
									rel="noreferrer"
								>
									{social.icon}
								</a>
							))}
						</div>
					)}
				</div>
			</section>

			<section>
				<h2 className="mb-8 text-center font-bold text-2xl tracking-tight md:mb-12 lg:text-4xl">
					Most recent articles by {author.name}
				</h2>

				<div className="grid gap-8 lg:grid-cols-2">
					{articlesByAuthor.map(article => (
						<CardArticle key={article.slug} article={article} />
					))}
				</div>
			</section>
		</>
	);
}
