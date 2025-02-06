"use client";

import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { SkeletonTable } from "@/components/skeleton-table";
import type { Account } from "@/http/accounts/get";
import { getAccounts } from "@/http/accounts/get";
import { useQuery } from "@tanstack/react-query";
import { memo, useState } from "react";
import { columns } from "./columns";
import { AccountForm } from "./form";

const AccountsConfigPage = memo(() => {
	const [addDialogIsOpen, setAddDialogIsOpen] = useState(false);

	const { data: accounts } = useQuery({
		queryKey: ["get-accounts"],
		queryFn: getAccounts,
		refetchOnMount: false,
	});

	const totalBalance = accounts
		? accounts.reduce(
				(acc: number, account: Account) => acc + account.balance,
				0
			)
		: null;

	return (
		<div className="container flex flex-col gap-4">
			<Header
				title="Contas"
				totalBalance={totalBalance}
				dialog={{
					title: "Adicionar conta",
					description:
						"Adicione uma nova conta para começar a gerenciar suas finanças.",
				}}
				FormData={AccountForm}
				addDialogIsOpen={addDialogIsOpen}
				setAddDialogIsOpen={setAddDialogIsOpen}
			/>
			<main>
				<section>
					{accounts ? (
						<DataTable columns={columns} data={accounts} />
					) : (
						<SkeletonTable />
					)}
				</section>
			</main>
		</div>
	);
});

export default AccountsConfigPage;
