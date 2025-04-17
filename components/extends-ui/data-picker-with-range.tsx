"use client";

import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import type { Dispatch, SetStateAction } from "react";

dayjs.locale(ptBR);

interface DatePickerWithRangeProps {
	date: DateRange;
	setDate: Dispatch<SetStateAction<DateRange>>;
	className?: string;
	formatFrom?: string;
	formatTo?: string;
}

export const DatePickerWithRange = ({
	date,
	setDate,
	className,
	formatFrom = "DD/MM/YYYY",
	formatTo = "DD/MM/YYYY",
}: DatePickerWithRangeProps) => {
	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground"
						)}
					>
						<CalendarIcon />
						{date?.from ? (
							date.to ? (
								<>
									{dayjs(date.from).format(formatFrom)} -{" "}
									{dayjs(date.to).format(formatTo)}
								</>
							) : (
								dayjs(date.from).format(formatFrom)
							)
						) : (
							<span>Selecione um período</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};
