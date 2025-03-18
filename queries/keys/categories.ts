import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";

const categoriesKeys = (transactionType: CATEGORY_TYPE | TRANSACTION_TYPE) => {
	const categoriesKeys = {
		all: [`get-${transactionType}`] as const,
		filters: () => [...categoriesKeys.all, "filter"] as const,
		filter: (filters: { month: number; year: number }) =>
			[...categoriesKeys.filters(), filters] as const,
		byIds: () => [...categoriesKeys.all, "byId"] as const,
		byId: (id: string) => [...categoriesKeys.byIds(), id] as const,
	};

	return categoriesKeys;
};

export { categoriesKeys };
