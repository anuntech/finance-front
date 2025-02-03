"use client";

// @ts-ignore
import logo from "@/app/icon.png";
import config from "@/config";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { JSX } from "react";
import ButtonSignin from "./ButtonSignin";

const links: {
	href: string;
	label: string;
}[] = [
	{
		href: "/#pricing",
		label: "Pricing",
	},
	{
		href: "/#testimonials",
		label: "Reviews",
	},
	{
		href: "/#faq",
		label: "FAQ",
	},
];

const cta: JSX.Element = <ButtonSignin extraStyle="btn-primary" />;

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const Header = () => {
	const searchParams = useSearchParams();
	const [isOpen, setIsOpen] = useState<boolean>(false);

	// setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setIsOpen(false);
	}, [searchParams]);

	return (
		<header className="bg-base-200">
			<nav
				className="container mx-auto flex items-center justify-between px-8 py-4"
				aria-label="Global"
			>
				{/* Your logo/name on large screens */}
				<div className="flex lg:flex-1">
					<Link
						className="flex shrink-0 items-center gap-2 "
						href="/"
						title={`${config.appName} homepage`}
					>
						<Image
							src={logo}
							alt={`${config.appName} logo`}
							className="w-8"
							placeholder="blur"
							priority={true}
							width={32}
							height={32}
						/>
						<span className="font-extrabold text-lg">{config.appName}</span>
					</Link>
				</div>
				{/* Burger button to open menu on mobile */}
				<div className="flex lg:hidden">
					<button
						type="button"
						className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
						onClick={() => setIsOpen(true)}
					>
						<span className="sr-only">Open main menu</span>
						{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="h-6 w-6 text-base-content"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							/>
						</svg>
					</button>
				</div>

				{/* Your links on large screens */}
				<div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-12">
					{links.map(link => (
						<Link
							href={link.href}
							key={link.href}
							className="link link-hover"
							title={link.label}
						>
							{link.label}
						</Link>
					))}
				</div>

				{/* CTA on large screens */}
				<div className="hidden lg:flex lg:flex-1 lg:justify-end">{cta}</div>
			</nav>

			{/* Mobile menu, show/hide based on menu state. */}
			<div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
				<div
					// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
					className={`fixed inset-y-0 right-0 z-10 w-full origin-right transform overflow-y-auto bg-base-200 px-8 py-4 transition duration-300 ease-in-out sm:max-w-sm sm:ring-1 sm:ring-neutral/10`}
				>
					{/* Your logo/name on small screens */}
					<div className="flex items-center justify-between">
						<Link
							className="flex shrink-0 items-center gap-2 "
							title={`${config.appName} homepage`}
							href="/"
						>
							<Image
								src={logo}
								alt={`${config.appName} logo`}
								className="w-8"
								placeholder="blur"
								priority={true}
								width={32}
								height={32}
							/>
							<span className="font-extrabold text-lg">{config.appName}</span>
						</Link>
						<button
							type="button"
							className="-m-2.5 rounded-md p-2.5"
							onClick={() => setIsOpen(false)}
						>
							<span className="sr-only">Close menu</span>
							{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
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
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Your links on small screens */}
					<div className="mt-6 flow-root">
						<div className="py-4">
							<div className="flex flex-col items-start gap-y-4">
								{links.map(link => (
									<Link
										href={link.href}
										key={link.href}
										className="link link-hover"
										title={link.label}
									>
										{link.label}
									</Link>
								))}
							</div>
						</div>
						{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
						<div className="divider"></div>
						{/* Your CTA on small screens */}
						<div className="flex flex-col">{cta}</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
