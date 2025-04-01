import { DATE_CONFIG } from "@/types/enums/date-config";
import type { DATE_TYPE } from "@/types/enums/date-type";
import type { QueryKeys } from "@/types/query-keys";

const transactionsKeys: QueryKeys = {
	all: ["get-transactions"],
	filters: () => [...transactionsKeys.all, "filter"],
	filter: (filters: {
		month: number;
		year: number;
		from: Date;
		to: Date;
		dateConfig: DATE_CONFIG;
		dateType: DATE_TYPE;
		search: string;
	}) => {
		if (filters.search) {
			return [
				...transactionsKeys.all,
				JSON.stringify({ search: filters.search }),
			];
		}

		switch (filters.dateConfig) {
			case DATE_CONFIG.ALL:
				return [
					...transactionsKeys.filters(),
					JSON.stringify({
						dateType: filters.dateType,
					}),
				];
			case DATE_CONFIG.RANGE:
				return [
					...transactionsKeys.all,
					JSON.stringify({
						from: filters.from,
						to: filters.to,
						dateType: filters.dateType,
					}),
				];
			case DATE_CONFIG.SINGLE:
				return [
					...transactionsKeys.filters(),
					JSON.stringify({
						month: filters.month,
						year: filters.year,
						dateType: filters.dateType,
					}),
				];
			default:
				return [];
		}
	},
};

export { transactionsKeys };
