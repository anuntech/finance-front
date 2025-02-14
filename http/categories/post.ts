import { api } from "@/libs/api";

export interface Category {
	name: string;
	icon: string;
}

export const createCategory = async (
	transaction: string,
	category: Category
) => {
	try {
		const response = await api.post("/category", {
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
