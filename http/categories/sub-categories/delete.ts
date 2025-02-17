import { api } from "@/libs/api";

interface DeleteSubCategory {
	id: string;
	categoryId: string;
}

export const deleteSubCategory = async (
	deleteSubCategory: DeleteSubCategory
) => {
	try {
		const response = await api.delete(
			`/category/sub-category/${deleteSubCategory.categoryId}?ids=${deleteSubCategory.id}`
		);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
