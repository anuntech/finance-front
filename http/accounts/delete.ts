import { api } from "@/libs/api";

export interface Account {
	id: string;
}

export const deleteAccount = async (account: Account) => {
	try {
		const response = await api.delete(`/account?ids=${account.id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
