import config from "@/config";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { formatBalance } from "@/utils/format-balance";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DatePicker } from "./date-picker";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";

interface Props {
	title: string;
	subtitle?: string | null;
	totalBalance: number | null;
	backLink?: string;
}

dayjs.locale(ptBR);

export const Header = ({ title, subtitle, totalBalance, backLink }: Props) => {
	const [date, setDate] = useState(new Date());

	const { setDate: setDateContext } = useDateWithMonthAndYear();

	const totalBalanceFormatted =
		totalBalance !== null ? formatBalance(totalBalance) : null;

	const version = config.version;

	const currentYear = new Date().getFullYear();

	const handleDateChange = (value: Date) => {
		setDate(value);
		setDateContext({
			month: value.getMonth(),
			year: value.getFullYear(),
		});
	};

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
					<span className="text-muted-foreground text-sm">
						{totalBalance !== null ? (
							totalBalanceFormatted
						) : (
							<Skeleton className="h-4 w-20" />
						)}
					</span>
				</div>
			</div>
			{subtitle && (
				<div className="flex items-center justify-center">
					<h2 className="z-10 text-lg text-muted-foreground hover:underline">
						{subtitle}
					</h2>
				</div>
			)}
			<div className="flex w-full max-w-72 items-center gap-2">
				<div className="flex w-full items-center justify-center">
					<Badge className="cursor-default">Alpha v{version}</Badge>
				</div>
				<DatePicker
					date={date}
					setDate={handleDateChange}
					format={getDateFormatted()}
					isMonthChange
				/>
			</div>
		</header>
	);
};
