import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import config from "@/config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { DATE_TYPE } from "@/types/enums/date-type";
import { formatBalance } from "@/utils/format-balance";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
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
	const { date, setDate } = useDateWithMonthAndYear();
	const { dateType, setDateType } = useDateType();

	const totalBalanceFormatted =
		totalBalance !== null ? formatBalance(totalBalance) : null;

	const currentTotalBalanceFormatted =
		currentTotalBalance !== null ? formatBalance(currentTotalBalance) : null;

	const version = config.version;

	const currentYear = new Date().getFullYear();

	const getDateFormatted = () => {
		if (date.getFullYear() !== currentYear) {
			return dayjs(date).format("MM/YYYY");
		}

		return dayjs(date).format("[MMMM]");
	};

	return (
		<header className="relative flex w-full justify-between gap-4">
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
			<div className="flex w-full max-w-lg items-center gap-2">
				<div className="flex w-full items-center justify-center">
					<Badge className="cursor-default">Alpha v{version}</Badge>
				</div>
				<DatePicker date={date} setDate={setDate} format={getDateFormatted()} />
				<Select
					defaultValue={DATE_TYPE.REGISTRATION}
					value={dateType}
					onValueChange={value => {
						setDateType(value as DATE_TYPE);
					}}
				>
					<SelectTrigger>
						<SelectValue placeholder="Selecione o tipo de data" />
					</SelectTrigger>
					<SelectContent>
						{Object.values(DATE_TYPE)
							.filter(dateType => dateType !== DATE_TYPE.NULL)
							.map(dateType => (
								<SelectItem key={dateType} value={dateType}>
									{dateType === DATE_TYPE.REGISTRATION && "Competência"}
									{dateType === DATE_TYPE.DUE && "Vencimento"}
									{dateType === DATE_TYPE.CONFIRMATION && "Confirmação"}
								</SelectItem>
							))}
					</SelectContent>
				</Select>
			</div>
		</header>
	);
};
