import config from "@/config";
import { Badge } from "./ui/badge";
interface Props {
	title: string;
	description: string;
}

export const ErrorLoading = ({ description }: Props) => {
	const version = config.version;

	return (
		<div className="container flex flex-col gap-2">
			<header className="relative flex min-h-12 w-full justify-between gap-4">
				<div className="z-20 flex w-full flex-col gap-2">
					<h1 className="font-bold text-2xl">Erro no Servidor</h1>
					<p>{description}</p>
				</div>
				<div className="flex w-full items-center justify-end gap-2">
					<Badge className="cursor-default">Beta v{version}</Badge>
				</div>
			</header>
		</div>
	);
};
