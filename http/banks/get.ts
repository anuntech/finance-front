import { api } from "@/libs/api";

export interface Bank {
	id: string;
	name: string;
	href: string;
}

export const getBanks = async () => {
	try {
		const response = await api.get<Array<Bank>>("banks");

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
