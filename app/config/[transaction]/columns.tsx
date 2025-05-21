"use client";
import { Actions } from "@/components/actions";
import { IconComponent } from "@/components/get-lucide-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category, SubCategory } from "@/http/categories/get";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import type { ColumnDef } from "@tanstack/react-table";
import { Tags } from "lucide-react";
import Link from "next/link";
import { useDeleteCategoryMutation } from "./_hooks/delete-category-mutation";
import { useDeleteSubCategoryMutation } from "./_hooks/delete-sub-category-mutation";
import { CategoryOrSubCategoryForm } from "./form";

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
			minSize: 75,
			size: 75,
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
		},
	];

	return columns;
};
