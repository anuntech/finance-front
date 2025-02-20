import { api } from "@/libs/api";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
interface Category {
	id: string;
	name: string;
	icon: string;
}

export const updateCategory = async (
	transaction: CATEGORY_TYPE,
	category: Category
) => {
	try {
		const response = await api.put(`/category/${category.id}`, {
			type: transaction,
			name: category.name,
			icon: category.icon,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
