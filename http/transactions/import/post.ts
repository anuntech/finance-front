import { api } from "@/libs/api";
import type { TransactionValuesImported } from "@/utils/import/_utils/process-value";

export const importTransactions = async (
	transactions: Array<TransactionValuesImported>
) => {
	try {
		const response = await api.post("/transaction/import", {
			transactions,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
