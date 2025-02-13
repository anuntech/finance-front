import type { IFormData } from "@/types/form-data";
import { formatBalance } from "@/utils/format-balance";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
interface Props {
	title: string;
	totalBalance: number | null;
	backLink?: string;
}

export const Header = ({ title, totalBalance, backLink }: Props) => {
	const totalBalanceFormatted =
		totalBalance !== null ? formatBalance(totalBalance) : null;

	return (
		<header className="flex items-center gap-4">
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
			{backLink && (
				<Link href={backLink} title="Voltar">
					<Button variant="ghost" size="icon">
						<ArrowLeftIcon className="h-4 w-4" />
					</Button>
				</Link>
			)}
		</header>
	);
};
