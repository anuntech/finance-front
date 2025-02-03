import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

const Pricing = () => {
	return (
		<section className="overflow-hidden bg-base-200" id="pricing">
			<div className="mx-auto max-w-5xl px-8 py-24">
				<div className="mb-20 flex w-full flex-col text-center">
					<p className="mb-8 font-medium text-primary">Pricing</p>
					<h2 className="font-bold text-3xl tracking-tight lg:text-5xl">
						Save hours of repetitive code and ship faster!
					</h2>
				</div>

				<div className="relative flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-stretch">
					{config.stripe.plans.map(plan => (
						<div key={plan.priceId} className="relative w-full max-w-lg">
							{plan.isFeatured && (
								<div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 z-20">
									<span
										// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
										className={`badge border-0 bg-primary font-semibold text-primary-content text-xs`}
									>
										POPULAR
									</span>
								</div>
							)}

							{plan.isFeatured && (
								// biome-ignore lint/style/useSelfClosingElements: <explanation>
								<div
									// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
									className={`-inset-[1px] absolute z-10 rounded-[9px] bg-primary`}
								></div>
							)}

							<div className="relative z-10 flex h-full flex-col gap-5 rounded-lg bg-base-100 p-8 lg:gap-8">
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="font-bold text-lg lg:text-xl">{plan.name}</p>
										{plan.description && (
											<p className="mt-2 text-base-content/80">
												{plan.description}
											</p>
										)}
									</div>
								</div>
								<div className="flex gap-2">
									{plan.priceAnchor && (
										<div className="mb-[4px] flex flex-col justify-end text-lg ">
											<p className="relative">
												{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
												<span className="absolute inset-x-0 top-[53%] h-[1.5px] bg-base-content"></span>
												<span className="text-base-content/80">
													${plan.priceAnchor}
												</span>
											</p>
										</div>
									)}
									{/* biome-ignore lint/style/noUnusedTemplateLiteral: <explanation> */}
									<p className={`font-extrabold text-5xl tracking-tight`}>
										${plan.price}
									</p>
									<div className="mb-[4px] flex flex-col justify-end">
										<p className="font-semibold text-base-content/60 text-xs uppercase">
											USD
										</p>
									</div>
								</div>
								{plan.features && (
									<ul className="flex-1 space-y-2.5 text-base leading-relaxed">
										{plan.features.map((feature, i) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											<li key={i} className="flex items-center gap-2">
												{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													className="h-[18px] w-[18px] shrink-0 opacity-80"
												>
													<path
														fillRule="evenodd"
														d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
														clipRule="evenodd"
													/>
												</svg>

												<span>{feature.name} </span>
											</li>
										))}
									</ul>
								)}
								<div className="space-y-2">
									<ButtonCheckout priceId={plan.priceId} />

									<p className="relative flex items-center justify-center gap-2 text-center font-medium text-base-content/80 text-sm">
										Pay once. Access forever.
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Pricing;
