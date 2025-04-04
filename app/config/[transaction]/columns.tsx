"use client";
import { Actions } from "@/components/actions";
import { IconComponent } from "@/components/get-lucide-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { deleteCategory } from "@/http/categories/delete";
import type { Category, SubCategory } from "@/http/categories/get";
import { deleteSubCategory } from "@/http/categories/sub-categories/delete";
import { categoriesKeys } from "@/queries/keys/categories";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Tags } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CategoryOrSubCategoryForm } from "./form";

const useDeleteCategoryMutation = (transactionType: CATEGORY_TYPE) => {
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
			toast.success("Categoria deletada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar categoria: ${message}`);
		},
	});

	return deleteCategoryMutation;
};

const useDeleteSubCategoryMutation = (
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

			toast.success("Subcategoria deletada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar subcategoria: ${message}`);
		},
	});

	return deleteSubCategoryMutation;
};

export const getColumns = (
	transactionType: CATEGORY_TYPE,
	categoryId?: string
) => {
	const columns: Array<ColumnDef<Category | SubCategory>> = [
		{
			id: "select",
			enableSorting: false,
			enableHiding: false,
			size: 25,
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() ? "indeterminate" : false)
					}
					onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<div className="flex max-w-10 items-center justify-start">
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={value => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				</div>
			),
		},
		{
			accessorKey: "name",
			meta: {
				headerName: "Nome",
			},
			header: "Nome",
			cell: ({ row }) => {
				return (
					<div className="flex items-center gap-2">
						<IconComponent name={row.getValue("icon")} />
						<span>{row.getValue("name")}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "icon",
			meta: {
				headerName: "Ícone",
			},
			header: "Ícone",
			enableHiding: false,
			enableSorting: false,
			enableGrouping: false,
			minSize: 0,
			size: 0,
			cell: ({ row }) => {
				return <span className="hidden">{row.original.icon}</span>;
			},
		},
		{
			id: "actions",
			enableHiding: false,
			enableSorting: false,
			minSize: 100,
			size: 100,
			cell: ({ row }) => {
				const deleteCategoryMutation =
					useDeleteCategoryMutation(transactionType);
				const deleteSubCategoryMutation = useDeleteSubCategoryMutation(
					transactionType,
					categoryId
				);

				return (
					<div className="flex items-center justify-end gap-2">
						{!categoryId && (
							<Link
								href={`?categoryId=${row.original.id}`}
								title="Subcategorias"
							>
								<Button variant="ghost" size="icon">
									<Tags className="h-5 w-5" />
								</Button>
							</Link>
						)}
						<Actions
							handleDelete={
								categoryId ? deleteSubCategoryMutation : deleteCategoryMutation
							}
							details={{
								title: "Editar categoria",
								description:
									"Edite a categoria para atualizar suas informações",
							}}
							FormData={CategoryOrSubCategoryForm}
							id={row.original.id}
						/>
					</div>
				);
			},
			footer: ({ table }) => {
				const deleteCategoryMutation =
					useDeleteCategoryMutation(transactionType);
				const deleteSubCategoryMutation = useDeleteSubCategoryMutation(
					transactionType,
					categoryId
				);

				const ids = table
					.getFilteredSelectedRowModel()
					.rows.map(row => row.original.id);
				const idsString = ids.join(",");

				return (
					<div className="flex justify-end">
						{ids.length > 0 && (
							<Actions
								handleDelete={
									categoryId
										? deleteSubCategoryMutation
										: deleteCategoryMutation
								}
								id={idsString}
							/>
						)}
					</div>
				);
			},
		},
	];

	return columns;
};
