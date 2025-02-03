"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { JSX } from "react";

interface Feature {
	title: string;
	description: string;
	type?: "video" | "image";
	path?: string;
	format?: string;
	alt?: string;
	svg?: JSX.Element;
}

// The features array is a list of features that will be displayed in the accordion.
// - title: The title of the feature
// - description: The description of the feature (when clicked)
// - type: The type of media (video or image)
// - path: The path to the media (for better SEO, try to use a local path)
// - format: The format of the media (if type is 'video')
// - alt: The alt text of the image (if type is 'image')
const features = [
	{
		title: "Emails",
		description:
			"Send transactional emails, setup your DNS to avoid spam folder (DKIM, DMARC, SPF in subdomain), and listen to webhook to receive & forward emails",
		type: "video",
		path: "https://d3m8mk7e1mf7xn.cloudfront.net/app/newsletter.webm",
		format: "video/webm",
		svg: (
			// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6"
			>
				<path
					strokeLinecap="round"
					d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
				/>
			</svg>
		),
	},
	{
		title: "Payments",
		description:
			"Create checkout sessions, handle webhooks to update user's account (subscriptions, one-time payments...) and tips to setup your account & reduce chargebacks",
		type: "image",
		path: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
		alt: "A computer",
		svg: (
			// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
				/>
			</svg>
		),
	},
	{
		title: "Authentication",
		description:
			"Magic links setup, login with Google walkthrough, save user in MongoDB/Supabase, private/protected pages & API calls",
		svg: (
			// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		),
	},
	{
		title: "Style",
		description:
			"Components, animations & sections (like this features section), 20+ themes with daisyUI, automatic dark mode",
		svg: (
			// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="h-6 w-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
				/>
			</svg>
		),
	},
] as Feature[];

// An SEO-friendly accordion component including the title and a description (when clicked.)
const Item = ({
	feature,
	isOpen,
	setFeatureSelected,
}: {
	index: number;
	feature: Feature;
	isOpen: boolean;
	setFeatureSelected: () => void;
}) => {
	const accordion = useRef(null);
	const { title, description, svg } = feature;

	return (
		<li>
			{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
			<button
				className="relative flex w-full items-center gap-2 py-5 text-left font-medium text-base md:text-lg"
				onClick={e => {
					e.preventDefault();
					setFeatureSelected();
				}}
				aria-expanded={isOpen}
			>
				<span className={`duration-100 ${isOpen ? "text-primary" : ""}`}>
					{svg}
				</span>
				<span
					className={`flex-1 text-base-content ${
						isOpen ? "font-semibold text-primary" : ""
					}`}
				>
					<h3 className="inline">{title}</h3>
				</span>
			</button>

			<div
				ref={accordion}
				// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
				className={`overflow-hidden text-base-content-secondary transition-all duration-300 ease-in-out`}
				style={
					isOpen
						? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
						: { maxHeight: 0, opacity: 0 }
				}
			>
				<div className="pb-5 leading-relaxed">{description}</div>
			</div>
		</li>
	);
};

// A component to display the media (video or image) of the feature. If the type is not specified, it will display an empty div.
// Video are set to autoplay for best UX.
const Media = ({ feature }: { feature: Feature }) => {
	const { type, path, format, alt } = feature;
	const style = "rounded-2xl aspect-square w-full sm:w-[26rem]";
	const size = {
		width: 500,
		height: 500,
	};

	if (type === "video") {
		return (
			<video
				className={style}
				autoPlay
				muted
				loop
				playsInline
				controls
				width={size.width}
				height={size.height}
			>
				<source src={path} type={format} />
			</video>
		);
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (type === "image") {
		return (
			<Image
				src={path}
				alt={alt}
				className={`${style} object-cover object-center`}
				width={size.width}
				height={size.height}
			/>
		);
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else {
		// biome-ignore lint/style/useSelfClosingElements: <explanation>
		return <div className={`${style} !border-none`}></div>;
	}
};

// A component to display 2 to 5 features in an accordion.
// By default, the first feature is selected. When a feature is clicked, the others are closed.
const FeaturesAccordion = () => {
	const [featureSelected, setFeatureSelected] = useState<number>(0);

	return (
		<section
			className="mx-auto max-w-7xl space-y-24 bg-base-100 py-24 md:space-y-32 md:py-32 "
			id="features"
		>
			<div className="px-8">
				<h2 className="mb-12 font-extrabold text-4xl tracking-tight md:mb-24 lg:text-6xl">
					All you need to ship your startup fast
					<span className="ml-1 whitespace-nowrap bg-neutral px-2 text-neutral-content leading-relaxed md:ml-1.5 md:px-4">
						and get profitable
					</span>
				</h2>
				<div className=" flex flex-col gap-12 md:flex-row md:gap-24">
					<div className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
						<ul className="w-full">
							{features.map((feature, i) => (
								<Item
									key={feature.title}
									index={i}
									feature={feature}
									isOpen={featureSelected === i}
									setFeatureSelected={() => setFeatureSelected(i)}
								/>
							))}
						</ul>

						<Media feature={features[featureSelected]} key={featureSelected} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default FeaturesAccordion;
