"use client";

import { DataTable } from "@/components/data-table";
import { ErrorLoading } from "@/components/error-loading";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import type { Account } from "@/http/accounts/get";
import { getAccounts } from "@/http/accounts/get";
import { importAccounts } from "@/http/accounts/import/post";
import { accountsKeys } from "@/queries/keys/accounts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { columns } from "./columns";
import { AccountForm } from "./form";

const AccountsConfigPage = () => {
	const [addComponentIsOpen, setAddComponentIsOpen] = useState(false);
	const [importDialogIsOpen, setImportDialogIsOpen] = useState(false);

	const queryClient = useQueryClient();

	const { month, year } = useDateWithMonthAndYear();

	const {
		data: accounts,
		isSuccess,
		isLoading,
		error,
	} = useQuery({
		queryKey: accountsKeys.filter({ month, year }),
		queryFn: () => getAccounts({ month, year }),
	});

	const hasAccountsError = !isSuccess && !isLoading;
	const errorMessageOfAccounts = `Ocorreu um erro ao carregar as contas: ${error?.message}. Por favor, tente novamente mais tarde.`;

	if (hasAccountsError)
		return <ErrorLoading title="Contas" description={errorMessageOfAccounts} />;

	const currentTotalBalance =
		accounts?.length > 0
			? accounts.reduce(
					(acc: number, account: Account) => acc + account.currentBalance,
					0
				)
			: 0;

	const totalBalance =
		accounts?.length > 0
			? accounts.reduce(
					(acc: number, account: Account) => acc + account.balance,
					0
				)
			: 0;

	const importAccountsMutation = useMutation({
		mutationFn: (data: Array<Account>) => importAccounts(data),
		onSuccess: (data: Array<Account>) => {
			queryClient.setQueryData(
				accountsKeys.filter({ month, year }),
				(accounts: Array<Account>) => {
					const newAccounts =
						accounts?.length > 0 ? [...data, ...accounts] : [...data];

					return newAccounts;
				}
			);
			queryClient.invalidateQueries({
				queryKey: accountsKeys.filter({ month, year }),
			});

			toast.success("Contas importadas com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao importar contas: ${message}`);
		},
	});

	return (
		<div className="container flex flex-col gap-2">
			<Header
				title="Contas"
				currentTotalBalance={isLoading ? null : currentTotalBalance}
				totalBalance={isLoading ? null : totalBalance}
			/>
			<main>
				<section>
					{isLoading ? (
						<SkeletonTable />
					) : (
						<DataTable
							columns={columns}
							data={accounts || []}
							details={{
								title: "Adicionar conta",
								description:
									"Adicione uma nova conta para começar a gerenciar suas finanças.",
							}}
							FormData={AccountForm}
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

export default AccountsConfigPage;
