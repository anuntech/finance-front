import type { IFormData } from "@/types/form-data";
import { formatBalance } from "@/utils/format-balance";
import { Skeleton } from "./ui/skeleton";
interface Props {
	title: string;
	totalBalance: number | null;
}

export const Header = ({ title, totalBalance }: Props) => {
	const totalBalanceFormatted =
		totalBalance !== null ? formatBalance(totalBalance) : null;

	return (
		<header className="flex flex-col gap-2">
			<h1 className="font-bold text-2xl">{title}</h1>
			<span className="text-muted-foreground text-sm">
				{totalBalance !== null ? (
					totalBalanceFormatted
				) : (
					<Skeleton className="h-4 w-20" />
				)}
			</span>
		</header>
	);
};
