import { api } from "@/libs/api";
import type { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import type { DATE_TYPE } from "@/types/enums/date-type";
import type { FREQUENCY } from "@/types/enums/frequency";
import type { INTERVAL } from "@/types/enums/interval";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { getUrlWithMonthAndYearAndDateType } from "@/utils/get-url-with-month-and-year-and-date-type";
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
	};
	frequency: FREQUENCY;
	repeatSettings?: {
		initialInstallment: number;
		count: number;
		interval: INTERVAL;
		currentCount: number;
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
	dateType?: DATE_TYPE;
}

export const getTransactions = async ({
	month,
	year,
	dateType,
}: GetTransactionsProps) => {
	try {
		const transactionsUrl = getUrlWithMonthAndYearAndDateType({
			url: "/transaction",
			month,
			year,
			dateType,
		});

		const response = await api.get<Array<Transaction>>(transactionsUrl);

		const transactionsWithTagsAndSubTags: Array<TransactionWithTagsAndSubTags> =
			response.data?.map(transaction => {
				const tagsIds = transaction.tags?.map(tag => tag.tagId).join(",");
				const subTagsIds = transaction.tags?.map(tag => tag.subTagId).join(",");

				return { ...transaction, tagsIds, subTagsIds };
			});

		return transactionsWithTagsAndSubTags || null;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
