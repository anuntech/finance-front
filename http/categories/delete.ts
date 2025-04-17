import { api } from "@/libs/api";

interface Category {
	id: string;
}

export const deleteCategory = async (category: Category) => {
	try {
		const response = await api.delete(`/category?ids=${category.id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
