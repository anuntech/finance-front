import { api } from "@/libs/api";

export interface Bank {
	id: string;
	name: string;
	image: string;
}

export const getBanks = async () => {
	try {
		const response = await api.get<Array<Bank>>("/bank");

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
