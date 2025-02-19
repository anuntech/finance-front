import { api } from "@/libs/api";
import axios from "axios";

export interface Transaction {
	id: string;
	name: string;
	description: string;
	assignedTo: string;
	supplier: string;
	balance: {
		value: number;
		parts: number;
		labor: number;
		discount: number;
		interest: number;
	};
	frequency: string;
	dueDate: Date;
	isConfirmed: boolean;
	categoryId: string;
	subCategoryId: string;
	accountId: string;
	registrationDate: Date;
	confirmationDate: Date;
}

export const getTransactions = async () => {
	try {
		const response = await axios.get<Array<Transaction>>("/api/transaction");

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
