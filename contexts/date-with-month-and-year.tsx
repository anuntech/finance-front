import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface IDateWithMonthAndYearContext {
	date: Date;
	month: number;
	year: number;
	setDate: Dispatch<SetStateAction<Date>>;
	setMonth: Dispatch<SetStateAction<number>>;
	setYear: Dispatch<SetStateAction<number>>;
}

export const DateWithMonthAndYearContext =
	createContext<IDateWithMonthAndYearContext>({
		date: new Date(),
		month: new Date().getMonth(),
		year: new Date().getFullYear(),
		setDate: () => {},
		setMonth: () => {},
		setYear: () => {},
	});

export const DateWithMonthAndYearProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [date, setDate] = useState<Date>(new Date());
	const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
	const [year, setYear] = useState<number>(new Date().getFullYear());

	useEffect(() => {
		if (!date) return;

		setMonth(date.getMonth() + 1);
		setYear(date.getFullYear());
	}, [date]);

	return (
		<DateWithMonthAndYearContext.Provider
			value={{ date, month, year, setDate, setMonth, setYear }}
		>
			{children}
		</DateWithMonthAndYearContext.Provider>
	);
};

export const useDateWithMonthAndYear = () => {
	const { date, month, year, setDate, setMonth, setYear } = useContext(
		DateWithMonthAndYearContext
	);

	return { date, month, year, setDate, setMonth, setYear };
};
