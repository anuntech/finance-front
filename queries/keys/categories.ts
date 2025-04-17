import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import { DATE_CONFIG } from "@/types/enums/date-config";
import type { DATE_TYPE } from "@/types/enums/date-type";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { QueryKeys } from "@/types/query-keys";
const categoriesKeys = (transactionType: CATEGORY_TYPE | TRANSACTION_TYPE) => {
	const categoriesKeys: QueryKeys = {
		all: [`get-${transactionType.toLowerCase()}s`],
		filters: () => [...categoriesKeys.all, "filter"],
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
					return [...categoriesKeys.all];
				case DATE_CONFIG.RANGE:
					return [
						...categoriesKeys.all,
						JSON.stringify({
							from: filters.from,
							to: filters.to,
						}),
					];
				case DATE_CONFIG.SINGLE:
					return [
						...categoriesKeys.filters(),
						JSON.stringify({
							month: filters.month,
							year: filters.year,
						}),
					];
				default:
					return [];
			}
		},
		byIds: () => [...categoriesKeys.all, "byId"],
		byId: (id: string) => [...categoriesKeys.byIds(), id],
	};

	return categoriesKeys;
};

export { categoriesKeys };
