import { api } from "@/libs/api";

export interface Transfer {
	sourceAccountId: string;
	destinationAccountId: string;
	amount: number;
}

export const transferAccount = async (transfer: Transfer) => {
	try {
		const response = await api.post("/account/transfer", {
			sourceAccountId: transfer.sourceAccountId,
			destinationAccountId: transfer.destinationAccountId,
			amount: transfer.amount,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
