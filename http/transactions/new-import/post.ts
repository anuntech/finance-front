import { api } from "@/libs/api";

interface NewImportTransactionsProps {
	formData: FormData;
	signal?: AbortSignal;
}

export const newImportTransactions = async ({
	formData,
	signal,
}: NewImportTransactionsProps) => {
	try {
		const response = await api.post("/transaction/import", formData, {
			signal,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		if (error.name === "CanceledError") {
			throw {
				name: "CanceledError",
			};
		}

		throw {
			message: error.response.data.errors,
		};
	}
};
