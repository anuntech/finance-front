import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import type { Category } from "@/http/categories/get";
import { deleteSubCategory } from "@/http/categories/sub-categories/delete";
import { categoriesKeys } from "@/queries/keys/categories";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteSubCategoryMutation = (
	transaction: CATEGORY_TYPE,
	categoryId: string
) => {
	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();

	const queryClient = useQueryClient();

	const deleteSubCategoryMutation = useMutation({
		mutationFn: (id: string) => deleteSubCategory({ id, categoryId }),
		onSuccess: (_, id: string) => {
			const ids = id.split(",");

			queryClient.setQueryData(
				categoriesKeys(transaction).filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
				}),
				(categories: Array<Category>) => {
					const category = categories?.find(
						category => category.id === categoryId
					);

					if (!category) return categories;

					const newSubCategories = category.subCategories?.filter(
						subCategory => !ids.includes(subCategory.id)
					);

					const { subCategories, ...rest } = category;
					const newCategory = {
						...rest,
						subCategories: newSubCategories,
					};

					const newCategories = categories?.map(category => {
						if (category.id === categoryId) return newCategory;

						return category;
					});

					return newCategories;
				}
			);
			queryClient.invalidateQueries({
				queryKey: categoriesKeys(transaction).filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
				}),
			});

			toast.success("Subcategoria(s) deletada(s) com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar subcategoria(s): ${message}`);
		},
	});

	return deleteSubCategoryMutation;
};
