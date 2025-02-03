import Link from "next/link";
import type { JSX } from "react";
import type { categoryType } from "../content";

// This is the category card that appears in the home page and in the category page
const CardCategory = ({
	category,
	tag = "h2",
}: {
	category: categoryType;
	tag?: keyof JSX.IntrinsicElements;
}) => {
	const TitleTag = tag;

	return (
		<Link
			className="rounded-box bg-base-200 p-4 text-base-content duration-200 hover:bg-neutral hover:text-neutral-content"
			href={`/blog/category/${category.slug}`}
			title={category.title}
			rel="tag"
		>
			<TitleTag className="font-medium md:text-lg">
				{category?.titleShort || category.title}
			</TitleTag>
		</Link>
	);
};

export default CardCategory;
