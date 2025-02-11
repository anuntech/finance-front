import { api } from "@/libs/api";

export interface Account {
	name: string;
	balance: number;
	bankId: string;
}

export const createAccount = async (account: Account) => {
	try {
		const response = await api.post("/account", {
			name: account.name,
			balance: account.balance,
			bankId: account.bankId,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
