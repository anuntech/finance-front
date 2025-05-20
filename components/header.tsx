"use client";

import config from "@/config";
// import { formatBalance } from "@/utils/format-balance";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
// import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
// import { Separator } from "./ui/separator";
// import { Skeleton } from "./ui/skeleton";

interface Props {
	title: string;
	subtitle?: string | null;
	currentTotalBalance: number | null;
	totalBalance: number | null;
	backLink?: string;
}

dayjs.locale(ptBR);

export const Header = ({
	// title,
	subtitle,
	// currentTotalBalance,
	// totalBalance,
	backLink,
}: Props) => {
	// const totalBalanceFormatted =
	// 	totalBalance !== null ? formatBalance(totalBalance) : null;

	// const currentTotalBalanceFormatted =
	// 	currentTotalBalance !== null ? formatBalance(currentTotalBalance) : null;

	const version = config.version;

	useEffect(() => {
		console.info(`${config.appName} running on Beta v${version}`);
	}, [version]);

	return subtitle && backLink ? (
		<header className="relative flex min-h-9 w-full justify-between gap-4">
			<div className="z-20 flex w-full items-center gap-4">
				{backLink && (
					<Link href={backLink} title="Voltar">
						<Button variant="ghost" size="icon">
							<ArrowLeftIcon className="h-4 w-4" />
						</Button>
					</Link>
				)}
				{/* <div className="flex flex-col gap-2">
					<h1 className="font-bold text-2xl">{title}</h1>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm">
							{currentTotalBalance !== null ? (
								<Badge variant="secondary">
									Saldo Atual: {currentTotalBalanceFormatted}
								</Badge>
							) : (
								<Skeleton className="h-4 w-28" />
							)}
						</span>
						<Separator orientation="vertical" />
						<span className="text-muted-foreground text-sm">
							{totalBalance !== null ? (
								<Badge variant="outline">
									Saldo Previsto: {totalBalanceFormatted}
								</Badge>
							) : (
								<Skeleton className="h-4 w-32" />
							)}
						</span>
					</div>
				</div> */}
				{subtitle && (
					<div className="flex items-center justify-center">
						<h2 className="z-10 text-muted-foreground hover:underline">
							{subtitle}
						</h2>
					</div>
				)}
			</div>
			{/* <div className="flex w-full items-center justify-end gap-2">
				<Badge className="cursor-default">Beta v{version}</Badge>
			</div> */}
		</header>
	) : (
		<></>
	);
};
