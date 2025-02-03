// A useful component when your product is challenging the status quo.
// Highlight the current pain points (left) and how your product is solving them (right)
// Try to match the lines from left to right, so the user can easily compare the two columns
const WithWithout = () => {
	return (
		<section className="bg-base-100">
			<div className="mx-auto max-w-5xl px-8 py-16 md:py-32 ">
				<h2 className="mb-12 text-center font-extrabold text-3xl tracking-tight md:mb-20 md:text-5xl">
					Tired of managing Stripe invoices?
				</h2>

				<div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-start md:gap-12">
					<div className="w-full rounded-lg bg-error/20 p-8 text-error md:p-12 ">
						<h3 className="mb-4 font-bold text-lg">
							Stripe invoices without ZenVoice
						</h3>

						<ul className="list-inside list-disc space-y-1.5 ">
							{/* Pains the user is experiencing by not using your product */}
							{[
								"Manually create invoices",
								"Or pay up to $2 per invoice",
								"Waste hours in customer support",
								"Can’t update details once sent (VAT, Tax ID)",
								"Can't make invoices for previous purchases",
							].map((item, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<li key={index} className="flex items-center gap-2">
									{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										fill="currentColor"
										className="h-4 w-4 shrink-0 opacity-75"
									>
										<path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
									</svg>
									{item}
								</li>
							))}
						</ul>
					</div>

					<div className="w-full rounded-lg bg-success/20 p-8 text-success md:p-12">
						<h3 className="mb-4 font-bold text-lg">
							Stripe invoices + ZenVoice
						</h3>

						<ul className="list-inside list-disc space-y-1.5 ">
							{/* Features of your product fixing the pain (try to match each with/withot lines) */}
							{[
								"Self-serve invoices",
								// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
								`One-time payment for unlimited invoices`,
								"No more customer support",
								"Editable invoices to stay compliant",
								"Invoices for any payment, even past ones",
							].map((item, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<li key={index} className="flex items-center gap-2">
									{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										fill="currentColor"
										className="h-4 w-4 shrink-0 opacity-75"
									>
										<path
											fillRule="evenodd"
											d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
											clipRule="evenodd"
										/>
									</svg>

									{item}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
};

export default WithWithout;
