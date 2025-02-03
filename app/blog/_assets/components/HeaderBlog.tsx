"use client";

// @ts-ignore
import logo from "@/app/icon.png";
import ButtonSignin from "@/components/ButtonSignin";
import config from "@/config";
import { Popover, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { categories } from "../content";

const links: {
	href: string;
	label: string;
}[] = [
	{
		href: "/blog/",
		label: "All Posts",
	},
];

const cta: JSX.Element = (
	<ButtonSignin text="Prevent disputes" extraStyle="btn-primary md:btn-sm" />
);

const ButtonPopoverCategories = () => {
	return (
		<Popover className="relative z-30">
			{({ open }) => (
				<>
					<Popover.Button
						className="link flex flex-nowrap items-center gap-1 text-base-content/80 no-underline duration-100 hover:text-base-content focus:text-base-content active:text-base-content"
						title="Open Blog categories"
					>
						Categories
						{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className={`h-5 w-5 duration-200 ${
								open ? "rotate-180 transform " : ""
							}`}
						>
							<path
								fillRule="evenodd"
								d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
								clipRule="evenodd"
							/>
						</svg>
					</Popover.Button>
					<Transition
						enter="transition duration-100 ease-out"
						enterFrom="transform scale-95 opacity-0"
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-75 ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-95 opacity-0"
					>
						<Popover.Panel className="absolute left-0 z-30 mt-3 w-screen max-w-full transform sm:max-w-sm">
							{({ close }) => (
								<div className="overflow-hidden rounded-box shadow-lg ring-1 ring-base-content ring-opacity-5">
									<div className="relative grid gap-2 overflow-hidden bg-base-100 p-2">
										{categories.map(category => (
											// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
											<div key={category.slug} onClick={() => close()}>
												<Link
													className="-m-1 block cursor-pointer rounded-box p-3 text-left duration-200 hover:bg-base-200"
													href={`/blog/category/${category.slug}`}
												>
													<div className="">
														<p className="mb-0.5 font-medium">
															{category?.titleShort || category.title}
														</p>
														<p className="text-sm opacity-80">
															{category?.descriptionShort ||
																category.description}
														</p>
													</div>
												</Link>
											</div>
										))}
									</div>
								</div>
							)}
						</Popover.Panel>
					</Transition>
				</>
			)}
		</Popover>
	);
};

const ButtonAccordionCategories = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<>
			<button
				onClick={e => {
					e.preventDefault();
					setIsOpen(!isOpen);
				}}
				aria-expanded={isOpen}
				type="button"
				className="link flex w-full items-center justify-between no-underline "
			>
				Categories
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					className={`h-5 w-5 duration-200 ${
						isOpen ? "rotate-180 transform " : ""
					}`}
				>
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{isOpen && (
				<ul className="space-y-4">
					{categories.map(category => (
						<li key={category.slug}>
							<Link
								href={`/blog/category/${category.slug}`}
								className="link link-hover text-base-content/80 duration-100 hover:text-base-content"
							>
								{category?.titleShort || category.title}
							</Link>
						</li>
					))}
				</ul>
			)}
		</>
	);
};

// This is the header that appears on all pages in the /blog folder.
// By default it shows the logo, the links, and the CTA.
// In the links, there's a popover with the categories.
const HeaderBlog = () => {
	const searchParams = useSearchParams();
	const [isOpen, setIsOpen] = useState<boolean>(false);

	// setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setIsOpen(false);
	}, [searchParams]);

	return (
		<header className="bg-base-200">
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3">
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
						className="-m-2.5 inline-flex items-center justify-center rounded-box p-2.5"
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
							className="link link-hover text-base-content/80 duration-100 hover:text-base-content focus:text-base-content active:text-base-content"
							title={link.label}
						>
							{link.label}
						</Link>
					))}

					<ButtonPopoverCategories />
				</div>

				{/* CTA on large screens */}
				<div className="hidden lg:flex lg:flex-1 lg:justify-end">{cta}</div>
			</nav>

			{/* Mobile menu, show/hide based on menu state. */}
			<div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
				<div
					// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
					className={`fixed inset-y-0 right-0 z-10 w-full origin-right transform overflow-y-auto bg-base-200 px-8 py-3 transition duration-300 ease-in-out sm:max-w-sm sm:ring-1 sm:ring-neutral/10`}
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
							className="-m-2.5 rounded-box p-2.5"
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
								<ButtonAccordionCategories />
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

export default HeaderBlog;
