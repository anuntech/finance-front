import { api } from "@/libs/api";
import type { Transaction } from "../get";

export interface TransactionsResult {
	failed: number;
	success: number;
	total: number;
	transactions: Array<Transaction>;
}

export const updateManyTransactions = async (
	id: string,
	data: Record<string, unknown>
) => {
	try {
		const response = await api.patch<TransactionsResult>(
			`/transaction?ids=${id}`,
			data,
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
