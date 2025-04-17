import { DatePickerWithRange } from "@/components/extends-ui/data-picker-with-range";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import type { TransactionWithTagsAndSubTags } from "@/http/transactions/get";
import { cn } from "@/lib/utils";
import { DATE_CONFIG } from "@/types/enums/date-config";
import { DATE_TYPE } from "@/types/enums/date-type";
import type { Table } from "@tanstack/react-table";
import type { Column } from "@tanstack/react-table";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { ArrowUpDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

dayjs.locale(ptBR);

export const FilterForDate = ({
	column,
	dateType,
}: {
	column: Column<TransactionWithTagsAndSubTags>;
	table: Table<TransactionWithTagsAndSubTags>;
	dateType: DATE_TYPE;
}) => {
	const { date: dateWithFromAndTo, setDate: setDateWithFromAndTo } =
		useDateWithFromAndTo();
	const { setDateType } = useDateType();
	const { setDateConfig } = useDateConfig();

	const [date, setDate] = useState<DateRange>(dateWithFromAndTo);

	const currentYear = new Date().getFullYear();

	const getDateFormattedWithRange = (date: Date) => {
		if (!date) return;

		if (date.getFullYear() === currentYear) {
			return dayjs(date).format("DD/MM");
		}

		return dayjs(date).format("DD/MM/YYYY");
	};

	useEffect(() => {
		if (date === dateWithFromAndTo) return;

		setDateWithFromAndTo(date);

		column.toggleSorting();

		if (!date) {
			setDateType(DATE_TYPE.NULL);
			setDateConfig(DATE_CONFIG.ALL);

			return;
		}

		setDateConfig(DATE_CONFIG.RANGE);
		setDateType(dateType);
	}, [
		date,
		column.toggleSorting,
		dateType,
		setDateConfig,
		setDateType,
		dateWithFromAndTo,
		setDateWithFromAndTo,
	]);

	return (
		<Command>
			<CommandList>
				<CommandGroup
					heading={
						<div className="flex w-full items-center justify-between gap-2 ">
							<span>Ordenação</span>
							<Button
								variant="outline"
								onClick={() =>
									column.toggleSorting(column.getIsSorted() === "asc", true)
								}
								className={cn(
									"h-8 w-8",
									column.getIsSorted() && "text-red-500 hover:text-red-600",
									!column.getCanSort() && "hidden"
								)}
								title="Ordenar"
							>
								<ArrowUpDown />
							</Button>
						</div>
					}
				/>
				<CommandGroup
					heading={
						<div className="flex w-full items-center justify-between gap-2 ">
							<span>Filtro</span>
						</div>
					}
				>
					<div className="p-2">
						<DatePickerWithRange
							date={date}
							setDate={setDate}
							formatFrom={getDateFormattedWithRange(date?.from)}
							formatTo={getDateFormattedWithRange(date?.to)}
						/>
					</div>
				</CommandGroup>
			</CommandList>
		</Command>
	);
};
