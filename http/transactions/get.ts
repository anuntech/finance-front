import { api } from "@/libs/api";
import type { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import type { DATE_CONFIG } from "@/types/enums/date-config";
import type { DATE_TYPE } from "@/types/enums/date-type";
import { FREQUENCY } from "@/types/enums/frequency";
import { INTERVAL } from "@/types/enums/interval";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { getUrlWithParams } from "@/utils/get-url-with-params";

export interface Transaction {
	id: string;
	type: TRANSACTION_TYPE;
	name: string;
	description?: string;
	assignedTo: string;
	supplier?: string;
	balance: {
		value: number;
		discount?: number;
		discountPercentage?: number;
		interest?: number;
		interestPercentage?: number;
		netBalance: number;
	};
	frequency: FREQUENCY;
	repeatSettings?: {
		initialInstallment: number;
		count: number;
		interval: INTERVAL;
		currentCount: number;
		customDay?: number;
	};
	dueDate: string;
	isConfirmed?: boolean;
	categoryId: string;
	subCategoryId: string;
	tags?: Array<{
		tagId?: string;
		subTagId?: string;
	}>;
	accountId: string;
	registrationDate: string;
	confirmationDate?: string;
	customFields?: Array<{
		id: string;
		type: CUSTOM_FIELD_TYPE;
		value: string;
	}>;
}

export interface TransactionWithTagsAndSubTags extends Transaction {
	tagsIds?: string;
	subTagsIds?: string;
}

interface GetTransactionsProps {
	month?: number;
	year?: number;
	from?: Date;
	to?: Date;
	dateConfig?: DATE_CONFIG;
	dateType?: DATE_TYPE;
	search?: string;
}

export const getTransactions = async ({
	month,
	year,
	from,
	to,
	dateConfig,
	dateType,
	search,
}: GetTransactionsProps) => {
	try {
		const transactionsUrl = getUrlWithParams({
			url: "/transaction",
			month,
			year,
			from,
			to,
			dateConfig,
			dateType,
			search,
		});

		const response = await api.get<Array<Transaction>>(transactionsUrl);

		const transactions = response.data?.map(transaction => {
			return {
				...transaction,
				tags: transaction.tags || [],
				// temporary
				repeatSettings:
					transaction.frequency === FREQUENCY.RECURRING
						? {
								...transaction.repeatSettings,
								interval: INTERVAL.MONTHLY,
							}
						: {
								...transaction.repeatSettings,
							},
				customField: transaction.customFields?.reduce(
					(obj, item) => {
						obj[item.id] = {
							value: item.value,
						};

						return obj;
					},
					{} as Record<string, { value: string }>
				),
			};
		});

		const transactionsWithTagsAndSubTags: Array<TransactionWithTagsAndSubTags> =
			transactions?.map(transaction => {
				const tagsIds = transaction.tags?.map(tag => tag.tagId).join(",");
				const subTagsIds = transaction.tags?.map(tag => tag.subTagId).join(",");

				return { ...transaction, tagsIds, subTagsIds };
			});

		return transactionsWithTagsAndSubTags || null;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
