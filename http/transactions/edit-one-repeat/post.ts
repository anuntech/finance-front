import { api } from "@/libs/api";
import type { FREQUENCY } from "@/types/enums/frequency";
import type { INTERVAL } from "@/types/enums/interval";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";

export interface Transaction {
	type: TRANSACTION_TYPE;
	name: string;
	mainId: string;
	mainCount: number;
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
	invoice?: string;
	frequency: FREQUENCY;
	repeatSettings?: {
		initialInstallment: number;
		count: number;
		interval: INTERVAL;
		customDay?: number;
	};
	dueDate: string;
	isConfirmed?: boolean;
	categoryId: string;
	subCategoryId: string;
	tags: Array<{
		tagId?: string;
		subTagId?: string;
	}>;
	accountId: string;
	registrationDate: string;
	confirmationDate?: string;
	customFields?: Array<{
		id: string;
		value: string | number;
	}>;
}

export const createTransactionEditOneRepeat = async (
	transaction: Transaction
) => {
	try {
		const response = await api.post("/transaction/edit", {
			type: transaction.type,
			name: transaction.name,
			mainId: transaction.mainId,
			mainCount: transaction.mainCount,
			description: transaction.description,
			assignedTo: transaction.assignedTo,
			supplier: transaction.supplier,
			balance: transaction.balance,
			invoice: transaction.invoice,
			frequency: transaction.frequency,
			repeatSettings: transaction.repeatSettings,
			dueDate: transaction.dueDate,
			isConfirmed: transaction.isConfirmed,
			categoryId: transaction.categoryId,
			subCategoryId: transaction.subCategoryId,
			tags: transaction.tags,
			accountId: transaction.accountId,
			registrationDate: transaction.registrationDate,
			confirmationDate: transaction.confirmationDate,
			customFields: transaction.customFields,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
