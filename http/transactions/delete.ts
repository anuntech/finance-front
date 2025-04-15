import { api } from "@/libs/api";

export interface Transaction {
	id: string;
}

export const deleteTransaction = async (transaction: Transaction) => {
	try {
		const response = await api.delete(`/transaction?ids=${transaction.id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
