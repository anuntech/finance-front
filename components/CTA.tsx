import config from "@/config";
import Image from "next/image";

const CTA = () => {
	return (
		<section className="hero relative min-h-screen overflow-hidden">
			<Image
				src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
				alt="Background"
				className="w-full object-cover"
				fill
			/>
			{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
			<div className="hero-overlay relative bg-neutral bg-opacity-70"></div>
			<div className="hero-content relative p-8 text-center text-neutral-content">
				<div className="flex max-w-xl flex-col items-center p-8 md:p-0">
					<h2 className="mb-8 font-bold text-3xl tracking-tight md:mb-12 md:text-5xl">
						Boost your app, launch, earn
					</h2>
					<p className="mb-12 text-lg opacity-80 md:mb-16">
						Don&apos;t waste time integrating APIs or designing a pricing
						section...
					</p>

					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button className="btn btn-primary btn-wide">
						Get {config.appName}
					</button>
				</div>
			</div>
		</section>
	);
};

export default CTA;
