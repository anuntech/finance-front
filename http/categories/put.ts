import { api } from "@/libs/api";

interface Category {
	id: string;
	name: string;
	icon: string;
}

export const updateCategory = async (
	transaction: string,
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
