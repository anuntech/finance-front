"use client";

import { DataTable } from "@/components/data-table";
import { ErrorLoading } from "@/components/error-loading";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import type { Account } from "@/http/accounts/get";
import { createAccount } from "@/http/accounts/post";
import { type Transaction, getTransactions } from "@/http/transactions/get";
import type { IAccountForm } from "@/schemas/account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { columns } from "./columns";
import { TransactionsForm } from "./form";

const TransactionsPage = () => {
	const [addComponentIsOpen, setAddComponentIsOpen] = useState(false);
	const [importDialogIsOpen, setImportDialogIsOpen] = useState(false);

	const queryClient = useQueryClient();

	const {
		data: transactions,
		isSuccess,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["get-transactions"],
		queryFn: getTransactions,
	});

	if (!isSuccess && !isLoading) {
		const message = `Ocorreu um erro ao carregar as transações: ${error?.message}. Por favor, tente novamente mais tarde.`;

		toast.error(message);

		return <ErrorLoading title="Transações" description={message} />;
	}

	const totalBalance =
		transactions?.length > 0
			? transactions.reduce((acc: number, transaction: Transaction) => {
					const balance =
						(transaction.balance.value ?? 0) +
						(transaction.balance.parts ?? 0) +
						(transaction.balance.labor ?? 0) -
						(transaction.balance.discount ?? 0) +
						(transaction.balance.interest ?? 0);

					return acc + balance;
				}, 0)
			: 0;

	const importAccountsMutation = useMutation({
		mutationFn: (data: IAccountForm) =>
			createAccount({
				name: data.name,
				balance: data.balance,
				bankId: data.bankId,
			}),
		onSuccess: (data: Account) => {
			queryClient.setQueryData(["get-accounts"], (accounts: Array<Account>) => {
				const newAccount: Account = {
					id: data.id,
					name: data.name,
					balance: data.balance,
					bankId: data.bankId,
				};

				const newAccounts =
					accounts?.length > 0 ? [newAccount, ...accounts] : [newAccount];

				return newAccounts;
			});
			queryClient.invalidateQueries({ queryKey: ["get-accounts"] });

			toast.success("Conta criada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar conta: ${message}`);
		},
	});

	return (
		<div className="container flex flex-col gap-2">
			<Header
				title="Transações"
				totalBalance={isLoading ? null : totalBalance}
			/>
			<main>
				<section>
					{isLoading ? (
						<SkeletonTable />
					) : (
						<DataTable
							columns={columns}
							data={transactions || []}
							details={{
								title: "Adicionar transação",
								description:
									"Adicione uma nova transação para começar a gerenciar suas finanças.",
							}}
							FormData={TransactionsForm}
							addComponentIsOpen={addComponentIsOpen}
							setAddComponentIsOpen={setAddComponentIsOpen}
							importDialogIsOpen={importDialogIsOpen}
							setImportDialogIsOpen={setImportDialogIsOpen}
							importMutation={importAccountsMutation}
						/>
					)}
				</section>
			</main>
		</div>
	);
};

export default TransactionsPage;
