import { api } from "@/libs/api";

export interface Account {
	id: string;
	name: string;
	balance: number;
	bankId: string;
}

export const updateAccount = async (account: Account) => {
	try {
		const response = await api.put(`/account/${account.id}`, {
			id: account.id,
			name: account.name,
			balance: account.balance,
			bankId: account.bankId,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
