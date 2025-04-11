import { api } from "@/libs/api";

export interface Transaction {
	accountIdFrom: string;
	accountIdTo: string;
	amount: number;
}

export const transferTransaction = async (transaction: Transaction) => {
	try {
		const response = await api.post("/transaction/transfer", {
			accountIdFrom: transaction.accountIdFrom,
			accountIdTo: transaction.accountIdTo,
			amount: transaction.amount,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
