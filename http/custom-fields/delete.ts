import { api } from "@/libs/api";

export interface CustomField {
	id: string;
}

export const deleteCustomField = async (customField: CustomField) => {
	try {
		const response = await api.delete(`/custom-field?ids=${customField.id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
