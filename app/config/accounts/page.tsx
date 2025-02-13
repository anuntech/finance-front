"use client";

import { DataTable } from "@/components/data-table";
import { ErrorLoading } from "@/components/error-loading";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import type { Account } from "@/http/accounts/get";
import { getAccounts } from "@/http/accounts/get";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { columns } from "./columns";

import { toast } from "react-hot-toast";
import { AccountForm } from "./form";

const AccountsConfigPage = () => {
	const [addDialogIsOpen, setAddDialogIsOpen] = useState(false);

	const {
		data: accounts,
		isSuccess,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["get-accounts"],
		queryFn: getAccounts,
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
							dialog={{
								title: "Adicionar conta",
								description:
									"Adicione uma nova conta para começar a gerenciar suas finanças.",
							}}
							FormData={AccountForm}
							addDialogIsOpen={addDialogIsOpen}
							setAddDialogIsOpen={setAddDialogIsOpen}
						/>
					)}
				</section>
			</main>
		</div>
	);
};

export default AccountsConfigPage;
