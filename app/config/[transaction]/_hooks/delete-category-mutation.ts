import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { deleteCategory } from "@/http/categories/delete";
import type { Category } from "@/http/categories/get";
import { categoriesKeys } from "@/queries/keys/categories";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteCategoryMutation = (transactionType: CATEGORY_TYPE) => {
	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();

	const queryClient = useQueryClient();

	const deleteCategoryMutation = useMutation({
		mutationFn: (id: string) => deleteCategory({ id }),
		onSuccess: (_, id: string) => {
			const ids = id.split(",");

			queryClient.setQueryData(
				categoriesKeys(transactionType).filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
				}),
				(categories: Array<Category>) => {
					const newCategories = categories?.filter(
						category => !ids.includes(category.id)
					);

					return newCategories;
				}
			);
			queryClient.invalidateQueries({
				queryKey: categoriesKeys(transactionType).filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
				}),
			});
			toast.success("Categoria(s) deletada(s) com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar categoria(s): ${message}`);
		},
	});

	return deleteCategoryMutation;
};
