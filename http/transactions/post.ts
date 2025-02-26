import { api } from "@/libs/api";
import type { FREQUENCY } from "@/types/enums/frequency";
import type { INTERVAL } from "@/types/enums/interval";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";

export interface Transaction {
	type: TRANSACTION_TYPE;
	name: string;
	description?: string;
	assignedTo: string;
	supplier: string;
	balance: {
		value: number;
		parts?: number;
		labor?: number;
		discount?: number;
		interest?: number;
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
	tagId?: string;
	subTagId?: string;
	accountId: string;
	registrationDate: string;
	confirmationDate?: string;
}

export const createTransaction = async (transaction: Transaction) => {
	try {
		const response = await api.post("/transaction", {
			type: transaction.type,
			name: transaction.name,
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
			tagId: transaction.tagId,
			subTagId: transaction.subTagId,
			accountId: transaction.accountId,
			registrationDate: transaction.registrationDate,
			confirmationDate: transaction.confirmationDate,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
