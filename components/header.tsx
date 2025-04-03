import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import config from "@/config";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { DATE_CONFIG } from "@/types/enums/date-config";
import { DATE_TYPE } from "@/types/enums/date-type";
import { formatBalance } from "@/utils/format-balance";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { ArrowLeftIcon, CalendarCog } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DatePickerWithRange } from "./extends-ui/data-picker-with-range";
import { DatePicker } from "./extends-ui/date-picker";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

interface Props {
	title: string;
	subtitle?: string | null;
	currentTotalBalance: number | null;
	totalBalance: number | null;
	backLink?: string;
}

dayjs.locale(ptBR);

export const Header = ({
	title,
	subtitle,
	currentTotalBalance,
	totalBalance,
	backLink,
}: Props) => {
	const { dateConfig, setDateConfig } = useDateConfig();
	const { dateType, setDateType } = useDateType();
	const { date, setDate } = useDateWithMonthAndYear();
	const { date: dateWithFromAndTo, setDate: setDateWithFromAndTo } =
		useDateWithFromAndTo();

	const totalBalanceFormatted =
		totalBalance !== null ? formatBalance(totalBalance) : null;

	const currentTotalBalanceFormatted =
		currentTotalBalance !== null ? formatBalance(currentTotalBalance) : null;

	const version = config.version;

	const currentYear = new Date().getFullYear();

	const getDateFormatted = (date: Date) => {
		if (!date) return;

		if (date.getFullYear() !== currentYear) {
			return dayjs(date).format("MM/YYYY");
		}

		return dayjs(date).format("[MMMM]");
	};

	const getDateFormattedWithRange = (date: Date) => {
		if (!date) return;

		if (date.getFullYear() === currentYear) {
			return dayjs(date).format("DD/MM");
		}

		return dayjs(date).format("DD/MM/YYYY");
	};

	return (
		<header className="relative flex w-full justify-between gap-4">
			<div className="z-20 flex w-full gap-4">
				{backLink && (
					<Link href={backLink} title="Voltar">
						<Button variant="ghost" size="icon">
							<ArrowLeftIcon className="h-4 w-4" />
						</Button>
					</Link>
				)}
				<div className="flex flex-col gap-2">
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
				</div>
			</div>
			{subtitle && (
				<div className="flex items-center justify-center">
					<h2 className="z-10 text-lg text-muted-foreground hover:underline">
						{subtitle}
					</h2>
				</div>
			)}
			<div className="flex w-full items-center justify-end gap-2">
				<Badge className="cursor-default">Alpha v{version}</Badge>
			</div>
		</header>
	);
};
