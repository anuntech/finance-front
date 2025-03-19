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
import { useState } from "react";
import { toast } from "react-hot-toast";
import { columns } from "./columns";
import { CustomFieldForm } from "./form";

const CustomFieldsConfigPage = () => {
	const [addComponentIsOpen, setAddComponentIsOpen] = useState(false);
	const [importDialogIsOpen, setImportDialogIsOpen] = useState(false);

	const { month, year } = useDateWithMonthAndYear();
	const { dateType } = useDateType();

	const {
		data: customFields,
		isSuccess,
		isLoading,
		error,
	} = useQuery({
		queryKey: customFieldsKeys.all,
		queryFn: () => getCustomFields(),
	});

	if (!isSuccess && !isLoading) {
		const message = `Ocorreu um erro ao carregar os campos personalizados: ${error?.message}. Por favor, tente novamente mais tarde.`;

		toast.error(message);

		return (
			<ErrorLoading title="Campos personalizáveis" description={message} />
		);
	}

	const {
		data: transactions,
		isSuccess: isSuccessTransactions,
		isLoading: isLoadingTransactions,
		error: errorTransactions,
	} = useQuery({
		queryKey: transactionsKeys.filter({ month, year, dateType }),
		queryFn: () => getTransactions({ month, year, dateType }),
	});

	if (!isSuccessTransactions && !isLoadingTransactions) {
		const message = `Ocorreu um erro ao carregar as transações: ${errorTransactions?.message}. Por favor, tente novamente mais tarde.`;

		toast.error(message);

		return (
			<ErrorLoading title="Campos personalizáveis" description={message} />
		);
	}

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
	const importCustomFieldsMutation = useMutation({
		mutationFn: () => Promise.resolve(),
	});

	return (
		<div className="container flex flex-col gap-2">
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
						/>
					)}
				</section>
			</main>
		</div>
	);
};

export default CustomFieldsConfigPage;
