import { api } from "@/libs/api";

interface Category {
	id: string;
}

export const deleteCategory = async (
	transaction: string,
	category: Category
) => {
	try {
		const response = await api.delete(`/${transaction}/${category.id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
