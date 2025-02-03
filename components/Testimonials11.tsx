"use client";

import config from "@/config";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { type JSX, useEffect, useRef, useState } from "react";

// Use this object to add an icon to the testimonial (optional) like the Product Hunt logo for instance.
// Only change the values if you add more referrings sites (currently Twitter & Product Hunt)
const refTypes: {
	productHunt: {
		id: string;
		ariaLabel: string;
		svg: JSX.Element;
	};
	twitter: {
		id: string;
		ariaLabel: string;
		svg: JSX.Element;
	};
	video: {
		id: string;
		ariaLabel?: null;
		svg?: null;
	};
	other: { id: string; ariaLabel?: null; svg?: null };
} = {
	productHunt: {
		id: "product_hunt",
		ariaLabel: "See user review on Product Hunt",
		svg: (
			// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 26.245 26.256"
				className="h-[18px] w-[18px]"
			>
				<path
					d="M26.254 13.128c0 7.253-5.875 13.128-13.128 13.128S-.003 20.382-.003 13.128 5.872 0 13.125 0s13.128 5.875 13.128 13.128"
					fill="#da552f"
				/>
				<path
					d="M14.876 13.128h-3.72V9.2h3.72c1.083 0 1.97.886 1.97 1.97s-.886 1.97-1.97 1.97m0-6.564H8.53v13.128h2.626v-3.938h3.72c2.538 0 4.595-2.057 4.595-4.595s-2.057-4.595-4.595-4.595"
					fill="#fff"
				/>
			</svg>
		),
	},
	twitter: {
		id: "twitter",
		ariaLabel: "See user post on Twitter",
		svg: (
			// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
			<svg
				className="h-5 w-5 fill-[#00aCee]"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
				<path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"></path>
			</svg>
		),
	},
	video: {
		id: "video",
	},
	other: { id: "other" },
};

// The list of your testimonials. It needs 11 items to fill the grid. The last one (11th) is featured on large devices (span 2 columns + big font)
const list: {
	username?: string;
	name: string;
	text: string;
	type?: (typeof refTypes)[keyof typeof refTypes];
	link?: string;
	img?: string | StaticImageData;
	videoPoster?: string;
	videoSrc?: string;
	videoWidth?: number;
	videoHeight?: number;
	videoType?: "video/ogg" | "video/mp4" | "video/webm";
}[] = [
	{
		// Show @username for social media like Twitter. Does not link anywhere but cool to display
		username: "marclou",
		name: "Marc Lou",
		text: "Really easy to use. The tutorials are really useful and explains how everything works. Hope to ship my next project really fast!",
		// use refTypes.other if you don't want to display an icon
		type: refTypes.twitter,
		// Link to the person's testimonial. It's more trustable
		link: "https://twitter.com/marc_louvion",
		// A statically imported image (usually from your public folder—recommended) or a link to the person's avatar. Shows a fallback letter if not provided
		img: "https://pbs.twimg.com/profile_images/1514863683574599681/9k7PqDTA_400x400.jpg",
		// You can display video testimonials to build more trust. Just swap the type above to "video" and add at least the video source below
		// videoSrc: "/jack.mp4"
	},
	{
		username: "the_mcnaveen",
		name: "Naveen",
		text: "Setting up everything from the ground up is a really hard, and time consuming process. What you pay for will save your time for sure.",
		type: refTypes.twitter,
		link: "https://twitter.com/the_mcnaveen",
	},
	{
		username: "wahab",
		name: "Wahab Shaikh",
		text: "Easily saves 15+ hrs for me setting up trivial stuff. Now, I can directly focus on shipping features rather than hours of setting up the same technologies from scratch. Feels like a super power! :D",
		type: refTypes.productHunt,
		link: "https://www.producthunt.com/products/shipfast-2/reviews?review=667971",
	},
	{
		name: "Sean",
		text: "Just purchased and cloned and *holy shit!* I realllyyy like what I'm seeing here!",
		type: refTypes.other,
	},
	{
		username: "krishna",
		name: "Krishna Kant",
		text: "Finally a good boilerplate for Nextjs, now I dont have to cry about it comparing with laravel ecosystem.",
		type: refTypes.productHunt,
		link: "https://www.producthunt.com/posts/shipfast-2?comment=2707061",
	},
	{
		username: "imgyf",
		name: "Yifan Goh",
		text: "It's a game changer  🚀 Comes with easy to follow tutorial, and saves you a ton of time. What's not to love?",
		type: refTypes.twitter,
		link: "https://twitter.com/imgyf/status/1697549891080532236?s=20",
	},
	{
		name: "Yazdun",
		text: "Yo Marc, I got the boilerplate, it's fantastic man you just save me 10 hours on each project",
		type: refTypes.other,
	},
	{
		name: "Marc Lou",
		text: "The tool is exactly what I didn't even know I needed.",
		videoPoster: "https://d1wkquwg5s1b04.cloudfront.net/demo/marcPoster.jpg",
		videoSrc: "https://d1wkquwg5s1b04.cloudfront.net/demo/marcVideo.mp4",
		videoHeight: 250,
		videoWidth: 500,
		type: refTypes.video,
	},
	{
		username: "zawwadx",
		name: "Zawwad Ul Sami",
		text: "It's an amazing minimalist, lightweight boilerplate with well-organized code. It has almost all the core features you would want in a SaaS boilerplate. As a new team last year it actually took us months to build a similar set of features at a stable level.",
		type: refTypes.twitter,
	},
	{
		username: "dan",
		name: "Dan Mindru",
		text: "Probably one of the most powerful things you can 'npm install' that I've seen",
		type: refTypes.productHunt,
		link: "https://www.producthunt.com/posts/shipfast-2?comment=2706763",
	},
	// The last testimonial is featured on big devices (span 2 columns + big font) 👇
	{
		username: "VicPivots",
		name: "Victor Abeledo",
		text: "Marc, I got your boilerplate and having the payments setup with Stripe + user auth is a blessing. This will save me like a week of work for each new side project I spin up. I appreciate that is well documented, as well. 100% worth it 🚀🚀🚀",
		type: refTypes.twitter,
		link: "https://twitter.com/VicPivots/status/1697352442986250413?s=20",
	},
];

// A single testimonial, to be rendered in  a list
const Testimonial = ({ i }: { i: number }) => {
	const testimonial = list[i];

	if (!testimonial) return null;

	if (testimonial.type === refTypes.video) {
		return <VideoTestimonial i={i} />;
	}

	return (
		<li key={i}>
			<figure className="relative h-full rounded-lg bg-base-100 p-6">
				<blockquote className="relative">
					<p className="text-base-content/80 text-sm">{testimonial.text}</p>
				</blockquote>
				<figcaption className="relative mt-4 flex items-center justify-start gap-4 border-base-content/5 border-t pt-4">
					<div className="shrink-0 overflow-hidden rounded-full bg-base-300">
						{testimonial.img ? (
							<Image
								className="h-10 w-10 rounded-full object-cover"
								src={list[i].img}
								alt={`${list[i].name}'s testimonial for ${config.appName}`}
								width={48}
								height={48}
							/>
						) : (
							<span className="flex h-10 w-10 items-center justify-center rounded-full bg-base-300 font-medium text-lg">
								{testimonial.name.charAt(0)}
							</span>
						)}
					</div>
					<div className="flex w-full items-end justify-between gap-2">
						<div>
							<div className="font-medium text-base-content text-sm">
								{testimonial.name}
							</div>
							{testimonial.username && (
								<div className="mt-0.5 text-base-content/80 text-sm">
									@{testimonial.username}
								</div>
							)}
						</div>

						{testimonial.link && testimonial.type?.svg && (
							<a
								href={testimonial.link}
								target="_blank"
								className="shrink-0 "
								aria-label={testimonial.type?.ariaLabel}
								rel="noreferrer"
							>
								{testimonial.type?.svg}
							</a>
						)}
					</div>
				</figcaption>
			</figure>
		</li>
	);
};

// A video tesionial to build trust. 2 or 3 on a wall of love is perfect.
const VideoTestimonial = ({ i }: { i: number }) => {
	const vidRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
		if (vidRef.current?.readyState != 0) {
			setIsLoading(false);
		}
	}, [vidRef?.current?.readyState]);

	const handlePlayVideo = () => {
		if (isPlaying) {
			vidRef.current.pause();
			setIsPlaying(false);
		} else {
			vidRef.current.play();
			setIsPlaying(true);

			if (vidRef.current?.readyState === 0) setIsLoading(true);
		}
	};

	const testimonial = list[i];

	if (!testimonial) return null;

	return (
		<li
			key={i}
			className="flex break-inside-avoid flex-col justify-center overflow-hidden rounded-lg bg-base-100 max-md:flex"
		>
			<div className="relative w-full">
				{isLoading && (
					// biome-ignore lint/style/useSelfClosingElements: <explanation>
					<span className="!h-24 !w-24 !bg-gray-50 -translate-x-1/2 -translate-y-1/2 loading loading-ring absolute top-1/2 left-1/2 z-40"></span>
				)}
				{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
				<video
					className="w-full"
					ref={vidRef}
					poster={testimonial.videoPoster}
					preload="metadata"
					playsInline
					width={testimonial.videoWidth}
					height={testimonial.videoHeight}
					onLoadedData={() => {
						console.log("Video is loaded!");
						setIsLoading(false);
					}}
				>
					<source
						src={testimonial.videoSrc}
						type={testimonial.videoType || "video/mp4"}
					/>
					Your browser does not support the videos
				</video>

				{!isPlaying && (
					// biome-ignore lint/style/useSelfClosingElements: <explanation>
					<div className="-inset-x-4 absolute bottom-0 h-24 translate-y-1/4 animate-opacity bg-gray-900/50 blur-lg"></div>
				)}

				<div className="absolute bottom-0 z-20 w-full">
					<div className="flex items-end justify-between p-4">
						<button
							className="group cursor-pointer"
							type="button"
							title="Play video"
							aria-label="Play video"
							onClick={handlePlayVideo}
						>
							{isPlaying ? (
								// PAUSE
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className=" h-14 w-14 animate-opacity fill-gray-50 drop-shadow-lg duration-100 ease-in group-hover:scale-[1.05]"
								>
									<path
										fillRule="evenodd"
										d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
										clipRule="evenodd"
									/>
								</svg>
							) : (
								// PLAY
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-14 w-14 animate-opacity fill-gray-50 drop-shadow-lg duration-100 ease-in group-hover:scale-[1.05]"
								>
									<path
										fillRule="evenodd"
										d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
										clipRule="evenodd"
									/>
								</svg>
							)}
						</button>

						{!isPlaying && (
							<div className="animate-opacity text-right">
								<p className="font-medium text-gray-50 drop-shadow">
									{testimonial.name}
								</p>
								<div className="rating">
									{[...Array(5)].map((_, i) => (
										// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="h-5 w-5 text-accent drop-shadow"
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={i}
										>
											<path
												fillRule="evenodd"
												d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
												clipRule="evenodd"
											/>
										</svg>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="relative z-20 select-none bg-accent p-4 font-medium text-accent-content text-base leading-tight">
				<p>&quot;{testimonial.text}&quot;</p>
			</div>
		</li>
	);
};

const Testimonials11 = () => {
	return (
		<section className="bg-base-200" id="testimonials">
			<div className="mx-auto max-w-7xl px-8 py-24">
				<div className="mb-20 flex w-full flex-col text-center">
					<div className="mb-8">
						<h2 className="font-extrabold text-4xl text-base-content sm:text-5xl">
							212 makers are already shipping faster!
						</h2>
					</div>
					<p className="mx-auto text-base text-base-content/80 leading-relaxed lg:w-2/3">
						Don&apos;t take our word for it. Here&apos;s what they have to say
						about {config.appName}.
					</p>
				</div>

				<ul
					// biome-ignore lint/a11y/noRedundantRoles: <explanation>
					// biome-ignore lint/a11y/useSemanticElements: <explanation>
					role="list"
					className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:max-w-none lg:grid-cols-4"
				>
					<li>
						{/* biome-ignore lint/a11y/noRedundantRoles: <explanation> */}
						{/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
						<ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
							{[...Array(3)].map((e, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<Testimonial key={i} i={i} />
							))}
						</ul>
					</li>

					<li className="order-none col-span-2 hidden grid-cols-1 gap-6 sm:gap-8 md:order-first md:grid md:grid-cols-2 lg:order-none">
						{/* BIG FEATURED TESTIMONIAL — THE LAST ONE IN THE LIST (11th) */}
						<ul className="col-span-2">
							<li>
								<figure className="relative h-full rounded-lg bg-base-100 p-6">
									<blockquote className="relative p-4">
										<p className="font-medium text-base-content text-lg">
											{list[list.length - 1].text}
										</p>
									</blockquote>
									<figcaption className="relative mt-4 flex items-center justify-start gap-4 border-base-content/5 border-t pt-4">
										<div className="shrink-0 overflow-hidden rounded-full bg-base-300">
											{list[list.length - 1].img ? (
												<Image
													className="h-12 w-12 rounded-full object-cover"
													src={list[list.length - 1].img}
													alt={`${
														list[list.length - 1].name
													}'s testimonial for ${config.appName}`}
													width={48}
													height={48}
												/>
											) : (
												<span className="flex h-12 w-12 items-center justify-center rounded-full bg-base-300 font-medium text-xl">
													{list[list.length - 1].name.charAt(0)}
												</span>
											)}
										</div>
										<div>
											<div className="font-medium text-base text-base-content">
												{list[list.length - 1].name}
											</div>
											{list[list.length - 1].username && (
												<div className="mt-1 text-base text-base-content/80">
													@{list[list.length - 1].username}
												</div>
											)}
										</div>
									</figcaption>
								</figure>
							</li>
						</ul>
						{/* biome-ignore lint/a11y/noRedundantRoles: <explanation> */}
						{/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
						<ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
							{[...Array(2)].map((e, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<Testimonial key={i} i={i + 3} />
							))}
						</ul>
						{/* biome-ignore lint/a11y/noRedundantRoles: <explanation> */}
						{/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
						<ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
							{[...Array(2)].map((e, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<Testimonial key={i} i={i + 5} />
							))}
						</ul>
					</li>
					<li>
						{/* biome-ignore lint/a11y/noRedundantRoles: <explanation> */}
						{/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
						<ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
							{[...Array(3)].map((e, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<Testimonial key={i} i={i + 7} />
							))}
						</ul>
					</li>
				</ul>
			</div>
		</section>
	);
};

export default Testimonials11;
