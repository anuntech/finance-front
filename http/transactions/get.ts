import { api } from "@/libs/api";
import type { FREQUENCY } from "@/types/enums/frequency";
import type { INTERVAL } from "@/types/enums/interval";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
export interface Transaction {
	id: string;
	type: TRANSACTION_TYPE;
	name: string;
	description?: string;
	assignedTo: string;
	supplier?: string;
	balance: {
		value: number;
		parts?: number;
		labor?: number;
		discount?: number;
		discountPercentage?: number;
		interest?: number;
		interestPercentage?: number;
	};
	invoice?: string;
	frequency: FREQUENCY;
	repeatSettings?: {
		initialInstallment: number;
		count: number;
		interval: INTERVAL;
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
}

export interface TransactionWithTagsAndSubTags extends Transaction {
	tagsIds?: string;
	subTagsIds?: string;
}

const getTransactionsUrl = (month?: number, year?: number) => {
	if (month && year) {
		return `/transaction?month=${month + 1}&year=${year}`;
	}

	return "/transaction";
};
export const getTransactions = async (month?: number, year?: number) => {
	try {
		const transactionsUrl = getTransactionsUrl(month, year);

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
