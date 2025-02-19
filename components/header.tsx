import config from "@/config";
import { formatBalance } from "@/utils/format-balance";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
interface Props {
	title: string;
	subtitle?: string | null;
	totalBalance: number | null;
	backLink?: string;
}

export const Header = ({ title, subtitle, totalBalance, backLink }: Props) => {
	const totalBalanceFormatted =
		totalBalance !== null ? formatBalance(totalBalance) : null;
	const version = config.version;

	return (
		<header className="relative flex w-full gap-4">
			<div className="z-20 flex gap-4">
				{backLink && (
					<Link href={backLink} title="Voltar">
						<Button variant="ghost" size="icon">
							<ArrowLeftIcon className="h-4 w-4" />
						</Button>
					</Link>
				)}
				<div className="flex flex-col gap-2">
					<h1 className="font-bold text-2xl">{title}</h1>
					<span className="text-muted-foreground text-sm">
						{totalBalance !== null ? (
							totalBalanceFormatted
						) : (
							<Skeleton className="h-4 w-20" />
						)}
					</span>
				</div>
			</div>
			<div className="absolute top-0 right-0 bottom-0 left-0 z-10 flex items-center justify-center">
				{subtitle && (
					<h2 className="z-10 text-lg text-muted-foreground hover:underline">
						{subtitle}
					</h2>
				)}
				{subtitle === null && <Skeleton className="h-6 w-20" />}
			</div>
			<div className="absolute top-0 right-0 bottom-0 z-10 flex items-center justify-center">
				<Badge className="cursor-default">Beta v{version}</Badge>
			</div>
		</header>
	);
};
