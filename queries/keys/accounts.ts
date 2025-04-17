import { DATE_CONFIG } from "@/types/enums/date-config";
import type { DATE_TYPE } from "@/types/enums/date-type";
import type { QueryKeys } from "@/types/query-keys";

const accountsKeys: QueryKeys = {
	all: ["get-accounts"],
	filters: () => [...accountsKeys.all, "filter"],
	filter: (filters: {
		month: number;
		year: number;
		from: Date;
		to: Date;
		dateConfig: DATE_CONFIG;
		dateType: DATE_TYPE;
	}) => {
		switch (filters.dateConfig) {
			case DATE_CONFIG.ALL:
				return [...accountsKeys.all];
			case DATE_CONFIG.RANGE:
				return [
					...accountsKeys.all,
					JSON.stringify({
						from: filters.from,
						to: filters.to,
					}),
				];
			case DATE_CONFIG.SINGLE:
				return [
					...accountsKeys.filters(),
					JSON.stringify({
						month: filters.month,
						year: filters.year,
					}),
				];
			default:
				return [];
		}
	},
	byIds: () => [...accountsKeys.all, "byId"],
	byId: (id: string) => [...accountsKeys.byIds(), id],
};

export { accountsKeys };
