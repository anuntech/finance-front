import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

interface IDateWithMonthAndYearContext {
	date: {
		month: number;
		year: number;
	};
	setDate: (date: { month: number; year: number }) => void;
}

export const DateWithMonthAndYearContext =
	createContext<IDateWithMonthAndYearContext>({
		date: {
			month: new Date().getMonth(),
			year: new Date().getFullYear(),
		},
		setDate: () => {},
	});

export const DateWithMonthAndYearProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [date, setDate] = useState({
		month: new Date().getMonth(),
		year: new Date().getFullYear(),
	});

	const queryClient = useQueryClient();

	useEffect(() => {
		if (!date.month && !date.year) return;

		queryClient.resetQueries({
			queryKey: ["get-transactions"],
		});
	}, [date, queryClient]);

	return (
		<DateWithMonthAndYearContext.Provider value={{ date, setDate }}>
			{children}
		</DateWithMonthAndYearContext.Provider>
	);
};

export const useDateWithMonthAndYear = () => {
	const { date, setDate } = useContext(DateWithMonthAndYearContext);

	return { date, setDate };
};
