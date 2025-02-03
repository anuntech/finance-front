import Image from "next/image";
import Link from "next/link";
import type { articleType } from "../content";

// This is the author avatar that appears in the article page and in <CardArticle /> component
const Avatar = ({ article }: { article: articleType }) => {
	return (
		<Link
			href={`/blog/author/${article.author.slug}`}
			title={`Posts by ${article.author.name}`}
			className="group inline-flex items-center gap-2"
			rel="author"
		>
			<span itemProp="author">
				<Image
					src={article.author.avatar}
					// alt={`Avatar of ${article.author.name}`}
					alt=""
					className="h-7 w-7 rounded-full object-cover object-center"
					width={28}
					height={28}
				/>
			</span>
			<span className="group-hover:underline">{article.author.name}</span>
		</Link>
	);
};

export default Avatar;
