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
import type { Category, SubCategory } from "@/http/categories/get";
import { getCategories } from "@/http/categories/get";
import { createCategory } from "@/http/categories/post";
import { updateCategory } from "@/http/categories/put";
import { createSubCategory } from "@/http/categories/sub-categories/post";
import { updateSubCategory } from "@/http/categories/sub-categories/put";
import { cn } from "@/lib/utils";
import type { IAccountForm } from "@/schemas/account";
import {
	type ICategoryOrSubCategoryForm,
	categoryOrSubCategorySchema,
} from "@/schemas/category-or-subCategory";
import type { IFormData } from "@/types/form-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export const CategoryOrSubCategoryForm: IFormData = ({
	type,
	setOpenDialog,
	id,
}) => {
	const { transaction } = useParams<{ transaction: string }>();
	const params = useSearchParams();
	const categoryId = params.get("categoryId");

	const transactionNameApi = transaction.slice(0, -1);

	const queryClient = useQueryClient();

	const { data } = useQuery({
		queryKey: [`get-${transaction}`],
		queryFn: () => getCategories(transactionNameApi),
		select: (data: Array<Category>) => {
			if (data?.length > 0) {
				const category = data?.find(category => category.id === categoryId);

				if (category) {
					if (categoryId) {
						const subCategory = category.subCategories?.find(
							subCategory => subCategory.id === id
						);

						if (subCategory) {
							return {
								name: subCategory.name,
								icon: subCategory.icon,
							};
						}
					}

					return {
						name: category.name,
						icon: category.icon,
					};
				}

				return null;
			}

			return null;
		},
	});

	const { data: recipeId } = useQuery({
		queryKey: [`get-${transaction}`],
		queryFn: () => getCategories(transactionNameApi),
		select: (data: Array<Category>) => {
			if (data?.length > 0) {
				const category = data?.find(category => category.id === categoryId);

				if (category && categoryId) {
					return category.id;
				}

				return null;
			}

			return null;
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
			createCategory(transactionNameApi, {
				name: data.name,
				icon: data.icon,
			}),
		onSuccess: (data: Category) => {
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
			form.reset();

			setOpenDialog(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar categoria: ${message}`);
		},
	});

	const addSubCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			createSubCategory(transactionNameApi, {
				recipeId,
				subCategory: {
					name: data.name,
					icon: data.icon,
				},
			}),
		onSuccess: (data: Category) => {
			queryClient.setQueryData(
				[`get-${transaction}`],
				(categories: Array<Category>) => {
					const newCategory = categories?.map(category => {
						if (category.id === categoryId) {
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
						}

						return category;
					});

					return newCategory;
				}
			);
			queryClient.invalidateQueries({ queryKey: [`get-${transaction}`] });

			toast.success("Subcategoria criada com sucesso");
			form.reset();

			setOpenDialog(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar subcategoria: ${message}`);
		},
	});

	const updateCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			updateCategory(transactionNameApi, {
				id: id,
				name: data.name,
				icon: data.icon,
			}),
		onSuccess: (data: Category) => {
			queryClient.setQueryData(
				[`get-${transaction}`],
				(categories: Array<Category>) => {
					const newCategory = categories?.map(category => {
						if (category.id === id) {
							const categoryUpdated = {
								id: category.id,
								name: data.name,
								icon: data.icon,
								amount: category.amount,
								subCategories: category.subCategories,
							};

							return categoryUpdated;
						}

						return category;
					});

					return newCategory;
				}
			);
			queryClient.invalidateQueries({ queryKey: [`get-${transaction}`] });

			toast.success("Categoria atualizada com sucesso");
			form.reset();

			setOpenDialog(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar categoria: ${message}`);
		},
	});

	const updateSubCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			updateSubCategory(transactionNameApi, {
				recipeId,
				subCategory: {
					id: id,
					name: data.name,
					icon: data.icon,
				},
			}),
		onSuccess: (data: SubCategory) => {
			queryClient.setQueryData(
				[`get-${transaction}`],
				(categories: Array<Category>) => {
					const newCategory = categories?.map(category => {
						if (category.id === categoryId) {
							const newSubCategory = category.subCategories?.map(
								subCategory => {
									if (subCategory.id === id) {
										const subCategoryUpdated = {
											id: subCategory.id,
											name: data.name,
											icon: data.icon,
											amount: subCategory.amount,
										};

										return subCategoryUpdated;
									}

									return subCategory;
								}
							);

							return newSubCategory;
						}

						return category;
					});

					return newCategory;
				}
			);
			queryClient.invalidateQueries({ queryKey: [`get-${transaction}`] });

			toast.success("Subcategoria atualizada com sucesso");
			form.reset();

			setOpenDialog(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar subcategoria: ${message}`);
		},
	});

	const onSubmit = (data: IAccountForm) => {
		if (!form.formState.isValid) {
			toast.error("Preencha todos os campos obrigatórios");
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
						onClick={() => setOpenDialog(false)}
						className="w-full max-w-24"
						disabled={
							addCategoryMutation.isPending ||
							updateCategoryMutation.isPending ||
							addCategoryMutation.isSuccess ||
							updateCategoryMutation.isSuccess
						}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={
							!form.formState.isValid ||
							addCategoryMutation.isPending ||
							updateCategoryMutation.isPending ||
							addCategoryMutation.isSuccess ||
							updateCategoryMutation.isSuccess
						}
						className={cn(
							"w-full max-w-24",
							addCategoryMutation.isPending || updateCategoryMutation.isPending
								? "max-w-32"
								: ""
						)}
					>
						{addCategoryMutation.isPending ||
						updateCategoryMutation.isPending ? (
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
