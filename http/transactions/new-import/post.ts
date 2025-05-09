import { api } from "@/libs/api";

export const newImportTransactions = async (formData: FormData) => {
	try {
		const response = await api.post("/transaction/import", formData);

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.erros,
		};
	}
};
