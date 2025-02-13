import { api } from "@/libs/api";

interface DeleteSubCategory {
	id: string;
	categoryId: string;
}

export const deleteSubCategory = async (
	transaction: string,
	deleteSubCategory: DeleteSubCategory
) => {
	try {
		const response = await api.delete(
			`/${transaction}/${deleteSubCategory.categoryId}/${deleteSubCategory.id}`
		);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
