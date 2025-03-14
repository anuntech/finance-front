import { LoadingApp } from "@/components/loading-app";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { useQueryClient } from "@tanstack/react-query";
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

	const queryClient = useQueryClient();

	useEffect(() => {
		if (!date || !month || !year) return;

		const queryKeyTransactions = ["get-transactions"];
		const queryStateTransactions =
			queryClient.getQueryState(queryKeyTransactions);
		if (queryStateTransactions && queryStateTransactions.status !== "pending") {
			queryClient.resetQueries({
				queryKey: queryKeyTransactions,
			});
		}

		const queryKeyAccounts = ["get-accounts"];
		const queryStateAccounts = queryClient.getQueryState(queryKeyAccounts);
		if (queryStateAccounts && queryStateAccounts.status !== "pending") {
			queryClient.resetQueries({
				queryKey: queryKeyAccounts,
			});
		}

		for (const transaction of Object.values(TRANSACTION_TYPE)) {
			const queryKey = [`get-${transaction.toLowerCase()}s`];
			const queryState = queryClient.getQueryState(queryKey);
			if (queryState && queryState.status !== "pending") {
				queryClient.resetQueries({
					queryKey,
				});
			}
		}
	}, [date, month, year, queryClient]);

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
