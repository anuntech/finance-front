"use client";

import { DataTable } from "@/components/data-table";
import { ErrorLoading } from "@/components/error-loading";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useSearch } from "@/contexts/search";
import { getCustomFields } from "@/http/custom-fields/get";
import { getTransactionsWithInfiniteScroll } from "@/http/transactions/_utils/get-transactions-with-infinite-scroll";
import type { Transaction } from "@/http/transactions/get";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { transactionsKeys } from "@/queries/keys/transactions";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDeleteCustomFieldMutation } from "./_hooks/delete-custom-field-mutation";
import { columns } from "./columns";
import { CustomFieldForm } from "./form";

const CustomFieldsConfigPage = () => {
	const [addComponentIsOpen, setAddComponentIsOpen] = useState(false);
	const [importDialogIsOpen, setImportDialogIsOpen] = useState(false);

	const deleteCustomFieldMutation = useDeleteCustomFieldMutation();

	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();

	const {
		data: customFields,
		isLoading,
		error,
		isError,
	} = useQuery({
		queryKey: customFieldsKeys.all,
		queryFn: () => getCustomFields(),
	});

	const {
		data: transactionsWithPagination,
		isLoading: isLoadingTransactions,
		error: errorTransactions,
		isError: isErrorTransactions,
	} = useInfiniteQuery({
		queryKey: transactionsKeys.filter({
			month,
			year,
			from,
			to,
			dateConfig,
			dateType,
			search,
		}),
		queryFn: async ({ pageParam }) =>
			getTransactionsWithInfiniteScroll({
				offset: pageParam,
				month,
				year,
				from,
				to,
				dateConfig,
				dateType,
				search,
			}),
		initialPageParam: 0,
		getPreviousPageParam: firstPage => firstPage.previousPage,
		getNextPageParam: lastPage => lastPage.nextPage,
	});

	const transactions = transactionsWithPagination?.pages?.flatMap(
		page => page.data
	);

	const transactionsOnlyConfirmed = transactions?.filter(
		transaction => transaction.isConfirmed
	);

	const currentTotalBalance = useMemo(() => {
		return transactionsOnlyConfirmed?.length > 0
			? transactionsOnlyConfirmed.reduce(
					(acc: number, transaction: Transaction) => {
						const balance = transaction.balance.value;

						const balanceDiscountPercentage =
							transaction.balance.discountPercentage;
						const balanceInterestPercentage =
							transaction.balance.interestPercentage;

						let discount = transaction.balance.discount ?? 0;
						let interest = transaction.balance.interest ?? 0;

						if (balanceDiscountPercentage) {
							discount = (balance * (balanceDiscountPercentage ?? 0)) / 100;
						}

						if (balanceInterestPercentage) {
							interest = (balance * (balanceInterestPercentage ?? 0)) / 100;
						}

						const liquidValue = balance - discount + interest;

						if (transaction.type === TRANSACTION_TYPE.RECIPE) {
							return acc + liquidValue;
						}

						return acc - liquidValue;
					},
					0
				)
			: 0;
	}, [transactionsOnlyConfirmed]);

	const totalBalance = useMemo(() => {
		return transactions?.length > 0
			? transactions.reduce((acc: number, transaction: Transaction) => {
					const balance = transaction.balance.value;

					const balanceDiscountPercentage =
						transaction.balance.discountPercentage;
					const balanceInterestPercentage =
						transaction.balance.interestPercentage;

					let discount = transaction.balance.discount ?? 0;
					let interest = transaction.balance.interest ?? 0;

					if (balanceDiscountPercentage) {
						discount = (balance * (balanceDiscountPercentage ?? 0)) / 100;
					}

					if (balanceInterestPercentage) {
						interest = (balance * (balanceInterestPercentage ?? 0)) / 100;
					}

					const liquidValue = balance - discount + interest;

					if (transaction.type === TRANSACTION_TYPE.RECIPE) {
						return acc + liquidValue;
					}

					return acc - liquidValue;
				}, 0)
			: 0;
	}, [transactions]);

	// temporary
	const importCustomFieldsMutation = useMutation({
		mutationFn: () => Promise.resolve(),
	});

	if (isError)
		return (
			<ErrorLoading
				title="Campos personalizáveis"
				description={`Ocorreu um erro ao carregar os campos personalizados: ${error?.message}. Por favor, tente novamente mais tarde.`}
			/>
		);

	if (isErrorTransactions)
		return (
			<ErrorLoading
				title="Campos personalizáveis"
				description={`Ocorreu um erro ao carregar as transações: ${errorTransactions?.message}. Por favor, tente novamente mais tarde.`}
			/>
		);

	return (
		<div className="container-default flex flex-col gap-2">
			<Header
				title="Campos personalizáveis"
				currentTotalBalance={isLoadingTransactions ? null : currentTotalBalance}
				totalBalance={isLoadingTransactions ? null : totalBalance}
			/>
			<main>
				<section>
					{isLoading ? (
						<SkeletonTable />
					) : (
						<DataTable
							columns={columns}
							data={customFields || []}
							details={{
								title: "Adicionar campo personalizado",
								description:
									"Adicione um novo campo personalizado para começar a gerenciar suas finanças.",
							}}
							FormData={CustomFieldForm}
							addComponentIsOpen={addComponentIsOpen}
							setAddComponentIsOpen={setAddComponentIsOpen}
							importDialogIsOpen={importDialogIsOpen}
							setImportDialogIsOpen={setImportDialogIsOpen}
							importMutation={importCustomFieldsMutation}
							handleDelete={deleteCustomFieldMutation}
						/>
					)}
				</section>
			</main>
		</div>
	);
};

export default CustomFieldsConfigPage;
