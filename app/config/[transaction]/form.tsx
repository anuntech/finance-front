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
import { updateCategory } from "@/http/categories/put";
import { updateSubCategory } from "@/http/categories/sub-categories/put";
import { cn } from "@/lib/utils";
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
	addMutation,
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

	const updateCategoryMutation = useMutation({
		mutationFn: (data: ICategoryOrSubCategoryForm) =>
			updateCategory(transactionNameApi, {
				id: id,
				name: data.name,
				icon: data.icon,
			}),
		onSuccess: (_, data: Category) => {
			queryClient.setQueryData(
				[`get-${transaction}`],
				(categories: Array<Category>) => {
					const newCategory = categories?.map(category => {
						if (category.id !== id) return category;

						const categoryUpdated = {
							id: category.id,
							name: data.name,
							icon: data.icon,
							amount: category.amount,
							subCategories: category.subCategories,
						};

						return categoryUpdated;
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
				[`get-${transaction}`],
				(categories: Array<Category>) => {
					const newCategory = categories?.map(category => {
						if (category.id !== categoryId) return category;

						const newSubCategory = category.subCategories?.map(subCategory => {
							if (subCategory.id !== id) return subCategory;

							const subCategoryUpdated = {
								id: subCategory.id,
								name: data.name,
								icon: data.icon,
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
			queryClient.invalidateQueries({ queryKey: [`get-${transaction}`] });

			toast.success("Subcategoria atualizada com sucesso");
			form.reset();

			setOpenDialog(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar subcategoria: ${message}`);
		},
	});

	const onSubmit = (data: ICategoryOrSubCategoryForm) => {
		if (!form.formState.isValid) {
			toast.error("Preencha todos os campos obrigatórios");

			return;
		}

		if (type === "add") {
			if (!addMutation) throw new Error("Nenhuma mutação de adição encontrada");

			addMutation.mutate(data, {
				onSuccess: () => {
					addMutation.reset();
					form.reset();

					setOpenDialog(false);
				},
			});
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
						onClick={() => setOpenDialog(false)}
						className="w-full max-w-24"
						disabled={
							addMutation?.isPending ||
							updateCategoryMutation.isPending ||
							updateSubCategoryMutation.isPending ||
							addMutation?.isSuccess ||
							updateCategoryMutation.isSuccess ||
							updateSubCategoryMutation.isSuccess
						}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={
							!form.formState.isValid ||
							addMutation?.isPending ||
							updateCategoryMutation.isPending ||
							updateSubCategoryMutation.isPending ||
							addMutation?.isSuccess ||
							updateCategoryMutation.isSuccess ||
							updateSubCategoryMutation.isSuccess
						}
						className={cn(
							"w-full max-w-24",
							addMutation?.isPending ||
								updateCategoryMutation.isPending ||
								updateSubCategoryMutation.isPending
								? "max-w-32"
								: ""
						)}
					>
						{addMutation?.isPending ||
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
