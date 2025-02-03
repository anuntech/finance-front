"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
	question: string;
	answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
	{
		question: "What do I get exactly?",
		answer: <div className="space-y-2 leading-relaxed">Loreum Ipseum</div>,
	},
	{
		question: "Can I get a refund?",
		answer: (
			<p>
				Yes! You can request a refund within 7 days of your purchase. Reach out
				by email.
			</p>
		),
	},
	{
		question: "I have another question",
		answer: (
			<div className="space-y-2 leading-relaxed">Cool, contact us by email</div>
		),
	},
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
	const accordion = useRef(null);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<li>
			{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
			<button
				className="relative flex w-full items-center gap-2 border-base-content/10 border-t py-5 text-left font-semibold text-base md:text-lg"
				onClick={e => {
					e.preventDefault();
					setIsOpen(!isOpen);
				}}
				aria-expanded={isOpen}
			>
				<span
					className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
				>
					{item?.question}
				</span>
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
				<svg
					// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
					className={`ml-auto h-4 w-4 flex-shrink-0 fill-current`}
					viewBox="0 0 16 16"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						y="7"
						width="16"
						height="2"
						rx="1"
						className={`origin-center transform transition duration-200 ease-out ${
							isOpen && "rotate-180"
						}`}
					/>
					<rect
						y="7"
						width="16"
						height="2"
						rx="1"
						className={`origin-center rotate-90 transform transition duration-200 ease-out ${
							isOpen && "hidden rotate-180"
						}`}
					/>
				</svg>
			</button>

			<div
				ref={accordion}
				// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
				className={`overflow-hidden opacity-80 transition-all duration-300 ease-in-out`}
				style={
					isOpen
						? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
						: { maxHeight: 0, opacity: 0 }
				}
			>
				<div className="pb-5 leading-relaxed">{item?.answer}</div>
			</div>
		</li>
	);
};

const FAQ = () => {
	return (
		<section className="bg-base-200" id="faq">
			<div className="mx-auto flex max-w-7xl flex-col gap-12 px-8 py-24 md:flex-row">
				<div className="flex basis-1/2 flex-col text-left">
					<p className="mb-4 inline-block font-semibold text-primary">FAQ</p>
					<p className="font-extrabold text-3xl text-base-content sm:text-4xl">
						Frequently Asked Questions
					</p>
				</div>

				<ul className="basis-1/2">
					{faqList.map((item, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<FaqItem key={i} item={item} />
					))}
				</ul>
			</div>
		</section>
	);
};

export default FAQ;
