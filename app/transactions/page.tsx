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
import { type Transaction, getTransactions } from "@/http/transactions/get";
import { createTransaction } from "@/http/transactions/post";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { transactionsKeys } from "@/queries/keys/transactions";
import type { ITransactionsForm } from "@/schemas/transactions";
import { FREQUENCY } from "@/types/enums/frequency";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
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

	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();

	const queryClient = useQueryClient();

	const {
		data: transactions,
		isSuccess,
		isLoading,
		error,
	} = useQuery({
		queryKey: transactionsKeys.filter({
			month,
			year,
			from,
			to,
			dateConfig,
			dateType,
			search,
		}),
		queryFn: () =>
			getTransactions({ month, year, from, to, dateConfig, dateType, search }),
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
		mutationFn: (data: ITransactionsForm) =>
			createTransaction({
				type: data.type,
				name: data.name,
				description: data.description,
				assignedTo: data.assignedTo,
				supplier: data.supplier,
				balance: {
					value: data.balance.value,
					discount:
						data.balance.discount?.type === "value"
							? data.balance.discount?.value
							: null,
					discountPercentage:
						data.balance.discount?.type === "percentage"
							? data.balance.discount?.value
							: null,
					interest:
						data.balance.interest?.type === "value"
							? data.balance.interest?.value
							: null,
					interestPercentage:
						data.balance.interest?.type === "percentage"
							? data.balance.interest?.value
							: null,
				},
				frequency: data.frequency,
				repeatSettings:
					data.frequency === FREQUENCY.REPEAT
						? {
								initialInstallment: data.repeatSettings?.initialInstallment,
								count: data.repeatSettings?.count,
								interval: data.repeatSettings?.interval,
							}
						: null,
				dueDate: data.dueDate.toISOString(),
				isConfirmed: data.isConfirmed,
				categoryId: data.categoryId,
				subCategoryId: data.subCategoryId,
				tags: data.tagsAndSubTags,
				accountId: data.accountId,
				registrationDate: data.registrationDate.toISOString(),
				confirmationDate: data.confirmationDate?.toISOString() || null,
				customFields:
					data.customField && Object.keys(data.customField).length > 0
						? Object.entries(data.customField).map(([key, value]) => ({
								id: key,
								value: value.fieldValue,
							}))
						: [],
			}),
		onSuccess: (data: Transaction) => {
			queryClient.setQueryData(
				transactionsKeys.filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
					search,
				}),
				(transactions: Array<Transaction>) => {
					const newTransaction: Transaction = {
						id: data.id,
						type: data.type,
						name: data.name,
						description: data.description,
						assignedTo: data.assignedTo,
						supplier: data.supplier,
						balance: {
							value: data.balance.value,
							discount: data.balance.discount,
							discountPercentage: data.balance.discountPercentage,
							interest: data.balance.interest,
							interestPercentage: data.balance.interestPercentage,
							netBalance: data.balance.netBalance,
						},
						frequency: data.frequency,
						repeatSettings:
							data.frequency === FREQUENCY.REPEAT
								? {
										initialInstallment: data.repeatSettings?.initialInstallment,
										count: data.repeatSettings?.count,
										interval: data.repeatSettings?.interval,
										currentCount: data.repeatSettings?.currentCount,
									}
								: null,
						dueDate: data.dueDate,
						isConfirmed: data.isConfirmed,
						categoryId: data.categoryId,
						subCategoryId: data.subCategoryId,
						tags: data.tags,
						accountId: data.accountId,
						registrationDate: data.registrationDate,
						confirmationDate: data.confirmationDate ?? null,
						customFields: data.customFields,
					};

					const newTransactions =
						transactions?.length > 0
							? [newTransaction, ...transactions]
							: [newTransaction];

					return newTransactions;
				}
			);
			queryClient.invalidateQueries({
				queryKey: transactionsKeys.filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
					search,
				}),
			});

			toast.success("Transação criada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar transação: ${message}`);
		},
	});

	const details =
		transactionType === TRANSACTION_TYPE.RECIPE
			? detailsObject.recipe
			: detailsObject.expense;

	const columns = useMemo(() => {
		if (
			isLoading ||
			!isSuccess ||
			isCustomFieldsLoading ||
			!isCustomFieldsSuccess
		)
			return [];

		return getColumns(customFields);
	}, [
		customFields,
		isCustomFieldsLoading,
		isCustomFieldsSuccess,
		isLoading,
		isSuccess,
	]);

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
							columns={columns || []}
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
