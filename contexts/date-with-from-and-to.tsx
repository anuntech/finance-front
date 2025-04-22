import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import type { DateRange } from "react-day-picker";

interface IDateWithFromAndToContext {
	date: DateRange;
	from: Date;
	to: Date;
	setDate: Dispatch<SetStateAction<DateRange>>;
	setFrom: Dispatch<SetStateAction<Date>>;
	setTo: Dispatch<SetStateAction<Date>>;
}

export const DateWithFromAndToContext =
	createContext<IDateWithFromAndToContext>({
		date: {
			from: new Date(),
			to: new Date(),
		},
		from: new Date(),
		to: new Date(),
		setDate: () => {},
		setFrom: () => {},
		setTo: () => {},
	});

export const DateWithFromAndToProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const today = new Date();
	const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

	const [date, setDate] = useState<DateRange>({
		from: firstDayOfMonth,
		to: lastDayOfMonth,
	});
  
	const [from, setFrom] = useState<Date>(date?.from ?? firstDayOfMonth);
	const [to, setTo] = useState<Date>(date?.to ?? lastDayOfMonth);

	useEffect(() => {
		if (!date) return;

		setFrom(date.from);
		setTo(date.to);
	}, [date]);

	return (
		<DateWithFromAndToContext.Provider
			value={{ date, from, to, setDate, setFrom, setTo }}
		>
			{children}
		</DateWithFromAndToContext.Provider>
	);
};

export const useDateWithFromAndTo = () => {
	const { date, from, to, setDate, setFrom, setTo } = useContext(
		DateWithFromAndToContext
	);

	return { date, from, to, setDate, setFrom, setTo };
};
