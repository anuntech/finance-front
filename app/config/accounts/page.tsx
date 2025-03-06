"use client";

import { DataTable } from "@/components/data-table";
import { ErrorLoading } from "@/components/error-loading";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import type { Account } from "@/http/accounts/get";
import { getAccounts } from "@/http/accounts/get";
import { createAccount } from "@/http/accounts/post";
import type { IAccountForm } from "@/schemas/account";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { columns } from "./columns";
import { AccountForm } from "./form";

const AccountsConfigPage = () => {
	const [addComponentIsOpen, setAddComponentIsOpen] = useState(false);
	const [importDialogIsOpen, setImportDialogIsOpen] = useState(false);

	const queryClient = useQueryClient();

	const { date } = useDateWithMonthAndYear();

	const { month, year } = date;

	const {
		data: accounts,
		isSuccess,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["get-accounts"],
		queryFn: () => getAccounts({ month, year }),
	});

	if (!isSuccess && !isLoading) {
		toast.error(
			`Ocorreu um erro ao carregar as contas: ${error?.message}. Por favor, tente novamente mais tarde.`
		);

		return (
			<ErrorLoading
				title="Contas"
				description={`Ocorreu um erro ao carregar as contas: ${error?.message}. Por favor, tente novamente mais tarde.`}
			/>
		);
	}

	const totalBalance =
		accounts?.length > 0
			? accounts.reduce(
					(acc: number, account: Account) => acc + account.balance,
					0
				)
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
			<Header title="Contas" totalBalance={isLoading ? null : totalBalance} />
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
