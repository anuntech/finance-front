"use client";
import { Actions } from "@/components/actions";
import { IconComponent } from "@/components/get-lucide-icon";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/http/categories/delete";
import type { Category, SubCategory } from "@/http/categories/get";
import { deleteSubCategory } from "@/http/categories/sub-categories/delete";
import { formatBalance } from "@/utils/format-balance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Tags } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CategoryOrSubCategoryForm } from "./form";

export const getColumns = (transaction: string, categoryId?: string) => {
	const columns: Array<ColumnDef<Category | SubCategory>> = [
		{
			accessorKey: "name",
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
			accessorKey: "amount",
			header: "Saldo",
			cell: ({ row }) => {
				return <span>{formatBalance(row.getValue("amount"))}</span>;
			},
		},
		{
			id: "icon",
			accessorKey: "icon",
			enableHiding: false,
			enableSorting: false,
			cell: () => {
				return <></>;
			},
		},
		{
			id: "actions",
			enableHiding: false,
			enableSorting: false,
			cell: ({ row }) => {
				const queryClient = useQueryClient();

				const deleteCategoryMutation = useMutation({
					mutationFn: (id: string) => deleteCategory({ id }),
					onSuccess: (_, id: string) => {
						queryClient.setQueryData(
							[`get-${transaction}`],
							(categories: Array<Category>) => {
								const newCategories = categories?.filter(
									category => category.id !== id
								);

								return newCategories;
							}
						);
						queryClient.invalidateQueries({ queryKey: [`get-${transaction}`] });

						toast.success("Categoria deletada com sucesso");
					},
					onError: ({ message }) => {
						toast.error(`Erro ao deletar categoria: ${message}`);
					},
				});

				const deleteSubCategoryMutation = useMutation({
					mutationFn: (id: string) => deleteSubCategory({ id, categoryId }),
					onSuccess: (_, id: string) => {
						queryClient.setQueryData(
							[`get-${transaction}`],
							(categories: Array<Category>) => {
								const category = categories?.find(
									category => category.id === categoryId
								);

								if (!category) return categories;

								const newSubCategories = category.subCategories?.filter(
									subCategory => subCategory.id !== id
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
						queryClient.invalidateQueries({ queryKey: [`get-${transaction}`] });

						toast.success("Subcategoria deletada com sucesso");
					},
					onError: ({ message }) => {
						toast.error(`Erro ao deletar subcategoria: ${message}`);
					},
				});

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
							dialog={{
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
		},
	];

	return columns;
};
