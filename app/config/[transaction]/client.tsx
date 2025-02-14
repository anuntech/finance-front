"use client";

import { DataTable } from "@/components/data-table";
import { ErrorLoading } from "@/components/error-loading";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import {
	type Category,
	type SubCategory,
	getCategories,
} from "@/http/categories/get";
import { createCategory } from "@/http/categories/post";
import { createSubCategory } from "@/http/categories/sub-categories/post";
import type { ICategoryOrSubCategoryForm } from "@/schemas/category-or-subCategory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getColumns } from "./columns";
import { CategoryOrSubCategoryForm } from "./form";

interface Props {
	transaction: "recipes" | "expenses" | "tags";
	categoryId?: string;
}

const getTitle = (transaction: "recipes" | "expenses" | "tags") => {
	if (transaction === "recipes") return "Receitas";

	if (transaction === "expenses") return "Despesas";

	if (transaction === "tags") return "Etiquetas";
};

export const ClientComponent = ({ transaction, categoryId }: Props) => {
	const transactionNameApi = transaction.slice(0, -1);
	const title = getTitle(transaction);

	const [addDialogIsOpen, setAddDialogIsOpen] = useState(false);
	const [importDialogIsOpen, setImportDialogIsOpen] = useState(false);
	const [totalBalance, setTotalBalance] = useState(0);

	const queryClient = useQueryClient();

	const { data, isSuccess, isLoading, error } = useQuery({
		queryKey: [`get-${transaction}`],
		queryFn: () => getCategories(transactionNameApi),
		select: (data: Array<Category>) => {
			if (!(data?.length > 0)) return null;

			if (!categoryId) return data;

			const category = data?.find(category => category.id === categoryId);

			if (!category) return null;

			return category;
		},
	});

	if (!isSuccess && !isLoading) {
		const message = `Ocorreu um erro ao carregar as categorias: ${error?.message}. Por favor, tente novamente mais tarde.`;

		toast.error(message);

		return <ErrorLoading title={title} description={message} />;
	}

	useEffect(() => {
		if (categoryId) {
			const category = data as Category;
			const totalBalance =
				category?.subCategories?.length > 0
					? category.subCategories.reduce(
							(acc: number, subCategory: SubCategory) =>
								acc + subCategory.amount,
							0
						)
					: 0;

			setTotalBalance(totalBalance);
		}

		if (!categoryId) {
			const categories = data as Array<Category>;
			const totalBalance =
				categories?.length > 0
					? categories.reduce(
							(acc: number, category: Category) => acc + category.amount,
							0
						)
					: 0;

			setTotalBalance(totalBalance);
		}
	}, [data, categoryId]);

	const addCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			createCategory(transactionNameApi, {
				name: data.name,
				icon: data.icon,
			}),
		onSuccess: (_, data: Category) => {
			queryClient.setQueryData(
				[`get-${transaction}`],
				(categories: Array<Category>) => {
					const newCategory: Category = {
						id: data.id,
						name: data.name,
						icon: data.icon,
						amount: 0,
						subCategories: [],
					};

					const newCategories =
						categories?.length > 0
							? [newCategory, ...categories]
							: [newCategory];

					return newCategories;
				}
			);
			queryClient.invalidateQueries({ queryKey: [`get-${transaction}`] });

			toast.success("Categoria criada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar categoria: ${message}`);
		},
	});

	const addSubCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			createSubCategory({
				categoryId,
				subCategory: {
					name: data.name,
					icon: data.icon,
				},
			}),
		onSuccess: (_, data: Category) => {
			queryClient.setQueryData(
				[`get-${transaction}`],
				(categories: Array<Category>) => {
					const newCategory = categories?.map(category => {
						if (category.id !== categoryId) return category;

						const newSubCategory: SubCategory = {
							id: data.id,
							name: data.name,
							icon: data.icon,
							amount: 0,
						};

						const newSubCategories =
							category.subCategories?.length > 0
								? [newSubCategory, ...category.subCategories]
								: [newSubCategory];

						const categoryUpdated = {
							id: category.id,
							name: category.name,
							icon: category.icon,
							amount: category.amount,
							subCategories: newSubCategories,
						};

						return categoryUpdated;
					});

					return newCategory;
				}
			);
			queryClient.invalidateQueries({ queryKey: [`get-${transaction}`] });

			toast.success("Subcategoria criada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar subcategoria: ${message}`);
		},
	});

	const columns = getColumns(transaction, categoryId);

	return (
		<div className="container flex flex-col gap-2">
			<div className="flex w-full items-center gap-2">
				<Header
					title={title}
					subtitle={
						categoryId
							? !isLoading
								? (data as Category)?.name
								: null
							: undefined
					}
					totalBalance={isLoading ? null : totalBalance}
					backLink={categoryId && `/config/${transaction}`}
				/>
			</div>
			<main>
				<section>
					{isLoading ? (
						<SkeletonTable />
					) : (
						<DataTable
							columns={columns}
							data={
								categoryId
									? (data as Category)?.subCategories || []
									: (data as Array<Category>) || []
							}
							dialog={{
								title: "Adicionar categoria",
								description:
									"Adicione uma nova categoria para começar a gerenciar suas finanças.",
							}}
							FormData={CategoryOrSubCategoryForm}
							addDialogIsOpen={addDialogIsOpen}
							setAddDialogIsOpen={setAddDialogIsOpen}
							addMutation={
								categoryId ? addSubCategoryMutation : addCategoryMutation
							}
							importDialogIsOpen={importDialogIsOpen}
							setImportDialogIsOpen={setImportDialogIsOpen}
						/>
					)}
				</section>
			</main>
		</div>
	);
};
