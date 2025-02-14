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
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getColumns } from "./columns";
import { CategoryOrSubCategoryForm } from "./form";

interface Props {
	transaction: "recipes" | "expenses";
	categoryId?: string;
}

export const ClientComponent = ({ transaction, categoryId }: Props) => {
	const transactionNameApi = transaction.slice(0, -1);
	const title = transaction === "recipes" ? "Receitas" : "Despesas";

	const [addDialogIsOpen, setAddDialogIsOpen] = useState(false);
	const [totalBalance, setTotalBalance] = useState(0);

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
						/>
					)}
				</section>
			</main>
		</div>
	);
};
