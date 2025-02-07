interface Props {
	title: string;
	description: string;
}

export const ErrorLoading = ({ title, description }: Props) => {
	return (
		<div className="container flex flex-col gap-2">
			<h1 className="font-bold text-2xl">{title}</h1>
			<p>{description}</p>
		</div>
	);
};
