"use client";

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
import { Calendar as CalendarIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface DatePickerProps {
	date: Date;
	setDate: (date: Date) => void;
	disabled?: boolean;
	isHour?: boolean;
	className?: React.ComponentProps<typeof Button>["className"];
	children?: React.ReactNode;
	format?: string;
	isMonthChange?: boolean;
}

dayjs.locale(ptBR);

export function DatePicker({
	date,
	setDate,
	disabled = false,
	className,
	children,
	format = "DD/MM/YYYY",
	isMonthChange = false,
}: DatePickerProps) {
	// set the date with the current time
	const dateWithTime = new Date();

	date?.setUTCHours(dateWithTime.getUTCHours());
	date?.setUTCMinutes(dateWithTime.getUTCMinutes());
	date?.setUTCSeconds(dateWithTime.getUTCSeconds());
	date?.setUTCMilliseconds(dateWithTime.getUTCMilliseconds());

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-full justify-start overflow-hidden text-ellipsis text-left font-normal",
						!date && "text-muted-foreground",
						className
					)}
					disabled={disabled}
					title={date ? dayjs(date).format(format) : "Selecione uma data"}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					<input
						className="w-full cursor-pointer border-none bg-transparent outline-none ring-0 placeholder:text-foreground"
						placeholder={
							date ? dayjs(date).format(format) : "Selecione uma data"
						}
						readOnly
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="flex w-auto flex-col items-center justify-center space-y-2 p-2"
			>
				{children}
				<Calendar
					mode="single"
					selected={date}
					onSelect={setDate}
					initialFocus
					month={date}
					onMonthChange={month => {
						if (!isMonthChange) return;

						console.log(month);

						setDate(month);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
