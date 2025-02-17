"use client";
import { Actions } from "@/components/actions";
import { IconComponent } from "@/components/get-lucide-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
			id: "select",
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
			enableSorting: false,
			enableHiding: false,
		},
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
				return (
					<div>
						<span>{formatBalance(row.getValue("amount"))}</span>
					</div>
				);
			},
			footer: ({ table }) => {
				const total = table
					.getSelectedRowModel()
					.rows.reduce((acc, row) => acc + Number(row.getValue("balance")), 0);

				const formattedTotal = formatBalance(total);

				return (
					<div>
						<span>{formattedTotal}</span>
					</div>
				);
			},
		},
		{
			accessorKey: "icon",
			header: "Ícone",
			enableHiding: false,
			enableSorting: false,
			enableGrouping: false,
			cell: ({ row }) => {
				return <span className="hidden">{row.original.icon}</span>;
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
			footer: ({ table }) => {
				const queryClient = useQueryClient();

				const ids = table
					.getFilteredSelectedRowModel()
					.rows.map(row => row.original.id);
				const idsString = ids.join(",");

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
					<div className="flex justify-end">
						{idsString.length > 0 && (
							<Actions
								handleDelete={
									categoryId
										? deleteSubCategoryMutation
										: deleteCategoryMutation
								}
								FormData={CategoryOrSubCategoryForm}
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
