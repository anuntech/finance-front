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

export const getTransactions = async () => {
	try {
		const response = await api.get<Array<Transaction>>("/transaction");

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
