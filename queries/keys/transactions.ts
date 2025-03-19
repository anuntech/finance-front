import type { DATE_TYPE } from "@/types/enums/date-type";

const transactionsKeys = {
	all: ["get-transactions"] as const,
	filters: () => [...transactionsKeys.all, "filter"] as const,
	filter: (filters: {
		month: number;
		year: number;
		dateType: DATE_TYPE;
	}) => [...transactionsKeys.filters(), filters] as const,
};

export { transactionsKeys };
