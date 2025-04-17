import type { DATE_CONFIG } from "@/types/enums/date-config";
import type { DATE_TYPE } from "@/types/enums/date-type";
import type { TransactionWithTagsAndSubTags } from "../get";
import { getTransactions } from "../get";

interface GetTransactionsWithInfiniteScrollResponse {
	data: Array<TransactionWithTagsAndSubTags>;
	previousPage: number;
	nextPage: number;
}

export type GetTransactionsWithInfiniteScrollResult =
	Promise<GetTransactionsWithInfiniteScrollResponse>;

interface GetTransactionsWithInfiniteScrollProps {
	offset: number;
	limit?: number;
	month?: number;
	year?: number;
	from?: Date;
	to?: Date;
	dateConfig?: DATE_CONFIG;
	dateType?: DATE_TYPE;
	search?: string;
}

export const getTransactionsWithInfiniteScroll = async ({
	offset,
	month,
	year,
	from,
	to,
	dateConfig,
	dateType,
	search,
	limit = 25,
}: GetTransactionsWithInfiniteScrollProps): GetTransactionsWithInfiniteScrollResult => {
	try {
		const response = await getTransactions({
			month,
			year,
			from,
			to,
			dateConfig,
			dateType,
			search,
			offset,
			limit,
		});

		return {
			data: response.transactions,
			previousPage: undefined,
			nextPage: response.hasNextPage ? offset + limit : undefined,
		};
	} catch (error) {
		console.error(error);

		throw new Error(error);
	}
};
