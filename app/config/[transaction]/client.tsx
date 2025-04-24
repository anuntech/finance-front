"use client";

import { DataTable } from "@/components/data-table";
import { ErrorLoading } from "@/components/error-loading";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import {
	type Category,
	type SubCategory,
	getCategories,
} from "@/http/categories/get";
import {
	type CategoryWithType,
	importCategories,
} from "@/http/categories/import/post";
import { createSubCategory } from "@/http/categories/sub-categories/post";
import { categoriesKeys } from "@/queries/keys/categories";
import type { ICategoryOrSubCategoryForm } from "@/schemas/category-or-sub-category";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDeleteCategoryMutation } from "./_hooks/delete-category-mutation";
import { useDeleteSubCategoryMutation } from "./_hooks/delete-sub-category-mutation";
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

	return null;
};

export const getTransactionType = (
	transaction: "recipes" | "expenses" | "tags"
) => {
	if (transaction === "recipes") return CATEGORY_TYPE.RECIPE;

	if (transaction === "expenses") return CATEGORY_TYPE.EXPENSE;

	if (transaction === "tags") return CATEGORY_TYPE.TAG;

	return null;
};

export const ClientComponent = ({ transaction, categoryId }: Props) => {
	const transactionType = getTransactionType(transaction);
	const title = getTitle(transaction);

	const [addComponentIsOpen, setAddComponentIsOpen] = useState(false);
	const [importDialogIsOpen, setImportDialogIsOpen] = useState(false);
	const [currentTotalBalance, setCurrentTotalBalance] = useState(0);
	const [totalBalance, setTotalBalance] = useState(0);

	const deleteCategoryMutation = useDeleteCategoryMutation(transactionType);
	const deleteSubCategoryMutation = useDeleteSubCategoryMutation(
		transactionType,
		categoryId
	);

	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();

	const queryClient = useQueryClient();

	const { data, isLoading, error, isError } = useQuery({
		queryKey: categoriesKeys(transactionType).filter({
			month,
			year,
			from,
			to,
			dateConfig,
			dateType,
		}),
		queryFn: () =>
			getCategories({
				transaction: transactionType,
				month,
				year,
				from,
				to,
				dateConfig,
				dateType,
			}),
		select: (data: Array<Category>) => {
			if (!(data?.length > 0)) return null;

			if (!categoryId) return data;

			const category = data?.find(category => category.id === categoryId);

			if (!category) return null;

			return category;
		},
	});

	const importCategoryMutation = useMutation({
		mutationFn: (data: Array<ICategoryOrSubCategoryForm>) => {
			const dataWithType = data.map(item => ({
				...item,
				type: transactionType,
			})) as Array<CategoryWithType>;

			return importCategories(dataWithType);
		},
		onSuccess: (data: Array<Category>) => {
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
					const newCategories =
						categories?.length > 0 ? [...data, ...categories] : [...data];

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

			toast.success("Categorias importadas com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao importar categorias: ${message}`);
		},
	});

	const importSubCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			createSubCategory({
				categoryId,
				subCategory: {
					name: data.name,
					icon: data.icon,
				},
			}),
		onSuccess: (data: Category) => {
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
					const newCategory = categories?.map(category => {
						if (category.id !== categoryId) return category;

						const newSubCategory: SubCategory = {
							id: data.id,
							name: data.name,
							icon: data.icon,
							currentAmount: 0,
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

			toast.success("Subcategoria criada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar subcategoria: ${message}`);
		},
	});

	const columns = getColumns(transactionType, categoryId);

	useEffect(() => {
		if (categoryId) {
			const category = data as Category;
			const currentTotalBalance =
				category?.subCategories?.length > 0
					? category.subCategories.reduce(
							(acc: number, subCategory: SubCategory) =>
								acc + subCategory.currentAmount,
							0
						)
					: 0;
			const totalBalance =
				category?.subCategories?.length > 0
					? category.subCategories.reduce(
							(acc: number, subCategory: SubCategory) =>
								acc + subCategory.currentAmount,
							0
						)
					: 0;

			if (transactionType === CATEGORY_TYPE.EXPENSE) {
				setTotalBalance(-totalBalance);
				setCurrentTotalBalance(-currentTotalBalance);

				return;
			}

			setTotalBalance(totalBalance);
			setCurrentTotalBalance(currentTotalBalance);
		}

		if (!categoryId) {
			const categories = data as Array<Category>;
			const currentTotalBalance =
				categories?.length > 0
					? categories.reduce(
							(acc: number, category: Category) => acc + category.currentAmount,
							0
						)
					: 0;
			const totalBalance =
				categories?.length > 0
					? categories.reduce(
							(acc: number, category: Category) => acc + category.amount,
							0
						)
					: 0;

			if (transactionType === CATEGORY_TYPE.EXPENSE) {
				setTotalBalance(-totalBalance);
				setCurrentTotalBalance(-currentTotalBalance);

				return;
			}

			setTotalBalance(totalBalance);
			setCurrentTotalBalance(currentTotalBalance);
		}
	}, [data, categoryId, transactionType]);

	if (isError)
		return (
			<ErrorLoading
				title={title}
				description={`Ocorreu um erro ao carregar as categorias: ${error?.message}. Por favor, tente novamente mais tarde.`}
			/>
		);

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
					currentTotalBalance={isLoading ? null : currentTotalBalance}
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
							details={{
								title: "Adicionar categoria",
								description:
									"Adicione uma nova categoria para começar a gerenciar suas finanças.",
							}}
							FormData={CategoryOrSubCategoryForm}
							addComponentIsOpen={addComponentIsOpen}
							setAddComponentIsOpen={setAddComponentIsOpen}
							importDialogIsOpen={importDialogIsOpen}
							setImportDialogIsOpen={setImportDialogIsOpen}
							importMutation={
								categoryId ? importSubCategoryMutation : importCategoryMutation
							}
							handleDelete={
								categoryId ? deleteSubCategoryMutation : deleteCategoryMutation
							}
						/>
					)}
				</section>
			</main>
		</div>
	);
};
