import { AvatarSelector } from "@/components/avatar-selector";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import type { Category, SubCategory } from "@/http/categories/get";
import { getCategories } from "@/http/categories/get";
import { createCategory } from "@/http/categories/post";
import { updateCategory } from "@/http/categories/put";
import { createSubCategory } from "@/http/categories/sub-categories/post";
import { updateSubCategory } from "@/http/categories/sub-categories/put";
import { cn } from "@/lib/utils";
import { categoriesKeys } from "@/queries/keys/categories";
import {
	type ICategoryOrSubCategoryForm,
	categoryOrSubCategorySchema,
} from "@/schemas/category-or-sub-category";
import type { IFormData } from "@/types/form-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { getTransactionType } from "./client";

export const CategoryOrSubCategoryForm: IFormData = ({
	type,
	setComponentIsOpen,
	id,
}) => {
	const { transaction } = useParams<{
		transaction: "recipes" | "expenses" | "tags";
	}>();
	const params = useSearchParams();
	const categoryId = params.get("categoryId");

	const transactionType = getTransactionType(transaction);

	const { month, year } = useDateWithMonthAndYear();

	const queryClient = useQueryClient();

	const { data } = useQuery({
		queryKey: categoriesKeys(transactionType).filter({ month, year }),
		queryFn: () => getCategories({ transaction: transactionType, month, year }),
		select: (data: Array<Category>) => {
			if (!(data?.length > 0) || type !== "edit") return null;

			if (!categoryId) {
				const categoryById = data?.find(category => category.id === id);

				if (!categoryById) return null;

				return {
					name: categoryById.name,
					icon: categoryById.icon,
				};
			}

			const categoryByCategoryId = data?.find(
				category => category.id === categoryId
			);

			if (categoryByCategoryId) {
				const subCategoryByCategoryId =
					categoryByCategoryId.subCategories?.find(
						subCategory => subCategory.id === id
					);

				if (!subCategoryByCategoryId) return null;

				return {
					name: subCategoryByCategoryId.name,
					icon: subCategoryByCategoryId.icon,
				};
			}
		},
	});

	const form = useForm<ICategoryOrSubCategoryForm>({
		defaultValues: {
			name: type === "edit" ? data?.name : "",
			icon: type === "edit" ? data?.icon : "",
		},
		resolver: zodResolver(categoryOrSubCategorySchema),
	});

	const addCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			createCategory(transactionType, {
				name: data.name,
				icon: data.icon,
			}),
		onSuccess: (data: Category) => {
			queryClient.setQueryData(
				categoriesKeys(transactionType).filter({ month, year }),
				(categories: Array<Category>) => {
					const newCategory: Category = {
						id: data.id,
						name: data.name,
						icon: data.icon,
						currentAmount: 0,
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
			queryClient.invalidateQueries({
				queryKey: categoriesKeys(transactionType).filter({ month, year }),
			});

			toast.success("Categoria criada com sucesso");
			form.reset();

			setComponentIsOpen(false);
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
		onSuccess: (data: Category) => {
			queryClient.setQueryData(
				categoriesKeys(transactionType).filter({ month, year }),
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
							currentAmount: category.currentAmount,
							amount: category.amount,
							subCategories: newSubCategories,
						};

						return categoryUpdated;
					});

					return newCategory;
				}
			);
			queryClient.invalidateQueries({
				queryKey: categoriesKeys(transactionType).filter({ month, year }),
			});

			toast.success("Subcategoria criada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar subcategoria: ${message}`);
		},
	});

	const updateCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			updateCategory(transactionType, {
				id: id,
				name: data.name,
				icon: data.icon,
			}),
		onSuccess: (_, data: Category) => {
			queryClient.setQueryData(
				categoriesKeys(transactionType).filter({ month, year }),
				(categories: Array<Category>) => {
					const newCategory = categories?.map(category => {
						if (category.id !== id) return category;

						const categoryUpdated = {
							id: category.id,
							name: data.name,
							icon: data.icon,
							amount: category.amount,
							currentAmount: category.currentAmount,
							subCategories: category.subCategories,
						};

						return categoryUpdated;
					});

					return newCategory;
				}
			);
			queryClient.invalidateQueries({
				queryKey: categoriesKeys(transactionType).filter({ month, year }),
			});

			toast.success("Categoria atualizada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar categoria: ${message}`);
		},
	});

	const updateSubCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			updateSubCategory({
				categoryId,
				subCategory: {
					id: id,
					name: data.name,
					icon: data.icon,
				},
			}),
		onSuccess: (_, data: SubCategory) => {
			queryClient.setQueryData(
				categoriesKeys(transactionType).filter({ month, year }),
				(categories: Array<Category>) => {
					const newCategory = categories?.map(category => {
						if (category.id !== categoryId) return category;

						const newSubCategory = category.subCategories?.map(subCategory => {
							if (subCategory.id !== id) return subCategory;

							const subCategoryUpdated = {
								id: subCategory.id,
								name: data.name,
								icon: data.icon,
								currentAmount: subCategory.currentAmount,
								amount: subCategory.amount,
							};

							return subCategoryUpdated;
						});

						const { subCategories, ...rest } = category;
						const categoryUpdated = {
							...rest,
							subCategories: newSubCategory,
						};

						return categoryUpdated;
					});

					return newCategory;
				}
			);
			queryClient.invalidateQueries({
				queryKey: categoriesKeys(transactionType).filter({ month, year }),
			});

			toast.success("Subcategoria atualizada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar subcategoria: ${message}`);
		},
	});

	const onSubmit = (data: ICategoryOrSubCategoryForm) => {
		if (Object.keys(form.formState.errors).length > 0) {
			toast.error("Formulário inválido!");

			return;
		}

		if (type === "add") {
			if (categoryId) {
				addSubCategoryMutation.mutate(data);
			}

			if (!categoryId) {
				addCategoryMutation.mutate(data);
			}
		}

		if (type === "edit") {
			if (categoryId) {
				updateSubCategoryMutation.mutate(data);
			}

			if (!categoryId) {
				updateCategoryMutation.mutate(data);
			}
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="icon"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel>Ícone</FormLabel>
							<FormControl>
								<AvatarSelector
									data={field.value}
									onAvatarChange={field.onChange}
									className="h-20 w-20"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="name"
					render={() => (
						<FormItem className="w-full">
							<FormLabel>Nome</FormLabel>
							<FormControl>
								<Input placeholder="Nome da conta" {...form.register("name")} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex w-full items-center justify-end gap-2">
					<Button
						variant="outline"
						type="button"
						onClick={() => setComponentIsOpen(false)}
						className="w-full max-w-24"
						disabled={
							addCategoryMutation.isPending ||
							addSubCategoryMutation.isPending ||
							updateCategoryMutation.isPending ||
							updateSubCategoryMutation.isPending ||
							addCategoryMutation.isSuccess ||
							addSubCategoryMutation.isSuccess ||
							updateCategoryMutation.isSuccess ||
							updateSubCategoryMutation.isSuccess
						}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={
							addCategoryMutation.isPending ||
							addSubCategoryMutation.isPending ||
							updateCategoryMutation.isPending ||
							updateSubCategoryMutation.isPending ||
							addCategoryMutation.isSuccess ||
							addSubCategoryMutation.isSuccess ||
							updateCategoryMutation.isSuccess ||
							updateSubCategoryMutation.isSuccess
						}
						className={cn(
							"w-full max-w-24",
							addCategoryMutation.isPending ||
								addSubCategoryMutation.isPending ||
								updateCategoryMutation.isPending ||
								updateSubCategoryMutation.isPending
								? "max-w-32"
								: ""
						)}
					>
						{addCategoryMutation.isPending ||
						addSubCategoryMutation.isPending ||
						updateCategoryMutation.isPending ||
						updateSubCategoryMutation.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Salvando...
							</>
						) : (
							"Salvar"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
};
