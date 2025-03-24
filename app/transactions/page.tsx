"use client";

import { DataTable } from "@/components/data-table";
import { ErrorLoading } from "@/components/error-loading";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import { useDateType } from "@/contexts/date-type";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { getCustomFields } from "@/http/custom-fields/get";
import { type Transaction, getTransactions } from "@/http/transactions/get";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { transactionsKeys } from "@/queries/keys/transactions";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getColumns } from "./columns";
import { TransactionsForm } from "./form";

const detailsObject = {
	recipe: {
		title: "Adicionar receita",
		description:
			"Adicione uma nova receita para começar a gerenciar suas finanças.",
	},
	expense: {
		title: "Adicionar despesa",
		description:
			"Adicione uma nova despesa para começar a gerenciar suas finanças.",
	},
};

const TransactionsPage = () => {
	const [transactionType, setTransactionType] =
		useState<TRANSACTION_TYPE | null>(null);
	const [addComponentIsOpen, setAddComponentIsOpen] = useState(false);
	const [importDialogIsOpen, setImportDialogIsOpen] = useState(false);
	const [columns, setColumns] = useState<ColumnDef<Transaction>[]>([]);

	const { month, year } = useDateWithMonthAndYear();
	const { dateType } = useDateType();

	const {
		data: transactions,
		isSuccess,
		isLoading,
		error,
	} = useQuery({
		queryKey: transactionsKeys.filter({ month, year, dateType }),
		queryFn: () => getTransactions({ month, year, dateType }),
	});

	const {
		data: customFields,
		isSuccess: isCustomFieldsSuccess,
		isLoading: isCustomFieldsLoading,
		error: customFieldsError,
	} = useQuery({
		queryKey: customFieldsKeys.all,
		queryFn: () => getCustomFields(),
	});

	const hasTransactionsError = !isSuccess && !isLoading;
	const errorMessageOfTransactions = `Ocorreu um erro ao carregar as transações: ${error?.message}. Por favor, tente novamente mais tarde.`;

	if (hasTransactionsError)
		return (
			<ErrorLoading
				title="Transações"
				description={errorMessageOfTransactions}
			/>
		);

	const hasCustomFieldsError = !isCustomFieldsSuccess && !isCustomFieldsLoading;
	const errorMessageOfCustomFields = `Ocorreu um erro ao carregar os campos personalizados: ${customFieldsError?.message}. Por favor, tente novamente mais tarde.`;

	if (hasCustomFieldsError)
		return (
			<ErrorLoading
				title="Transações"
				description={errorMessageOfCustomFields}
			/>
		);

	const transactionsOnlyConfirmed = transactions?.filter(
		transaction => transaction.isConfirmed
	);

	const currentTotalBalance =
		transactionsOnlyConfirmed?.length > 0
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

	const totalBalance =
		transactions?.length > 0
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

	// temporary
	const importTransactionsMutation = useMutation({
		mutationFn: () => Promise.resolve(),
	});

	const details =
		transactionType === TRANSACTION_TYPE.RECIPE
			? detailsObject.recipe
			: detailsObject.expense;

	useEffect(() => {
		setColumns(getColumns(customFields));
	}, [customFields]);

	console.log(columns);

	return (
		<div className="container flex flex-col gap-2">
			<Header
				title="Transações"
				currentTotalBalance={isLoading ? null : currentTotalBalance}
				totalBalance={isLoading ? null : totalBalance}
			/>
			<main>
				<section>
					{isLoading || isCustomFieldsLoading ? (
						<SkeletonTable />
					) : (
						<DataTable
							columns={columns}
							data={transactions || []}
							details={details}
							FormData={TransactionsForm}
							addDialogProps={{
								dialogContent: {
									className: "max-w-[100dvh] overflow-y-auto max-w-screen-md",
								},
							}}
							addComponentIsOpen={addComponentIsOpen}
							setAddComponentIsOpen={setAddComponentIsOpen}
							importDialogIsOpen={importDialogIsOpen}
							setImportDialogIsOpen={setImportDialogIsOpen}
							importMutation={importTransactionsMutation}
							transactionType={transactionType}
							setTransactionType={setTransactionType}
						/>
					)}
				</section>
			</main>
		</div>
	);
};

export default TransactionsPage;
