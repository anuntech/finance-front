import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";
import type { articleType } from "../content";
import Avatar from "./Avatar";
import BadgeCategory from "./BadgeCategory";

// This is the article card that appears in the home page, in the category page, and in the author's page
const CardArticle = ({
	article,
	tag = "h2",
	showCategory = true,
	isImagePriority = false,
}: {
	article: articleType;
	tag?: keyof JSX.IntrinsicElements;
	showCategory?: boolean;
	isImagePriority?: boolean;
}) => {
	const TitleTag = tag;

	return (
		<article className="card overflow-hidden rounded-box bg-base-200">
			{article.image?.src && (
				<Link
					href={`/blog/${article.slug}`}
					className="link link-hover hover:link-primary"
					title={article.title}
					rel="bookmark"
				>
					<figure>
						<Image
							src={article.image.src}
							alt={article.image.alt}
							width={600}
							height={338}
							priority={isImagePriority}
							placeholder="blur"
							className="aspect-video object-cover object-center duration-200 ease-in-out hover:scale-[1.03]"
						/>
					</figure>
				</Link>
			)}
			<div className="card-body">
				{/* CATEGORIES */}
				{showCategory && (
					<div className="flex flex-wrap gap-2">
						{article.categories.map(category => (
							<BadgeCategory category={category} key={category.slug} />
						))}
					</div>
				)}

				{/* TITLE WITH RIGHT TAG */}
				<TitleTag className="mb-1 font-bold text-xl md:text-2xl">
					<Link
						href={`/blog/${article.slug}`}
						className="link link-hover hover:link-primary"
						title={article.title}
						rel="bookmark"
					>
						{article.title}
					</Link>
				</TitleTag>

				<div className=" space-y-4 text-base-content/80">
					{/* DESCRIPTION */}
					<p className="">{article.description}</p>

					{/* AUTHOR & DATE */}
					<div className="flex items-center gap-4 text-sm">
						<Avatar article={article} />

						<span itemProp="datePublished">
							{new Date(article.publishedAt).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
							})}
						</span>
					</div>
				</div>
			</div>
		</article>
	);
};

export default CardArticle;
