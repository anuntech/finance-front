"use client";

import { Header } from "@/components/header";
import type { Account } from "@/http/accounts/get";
import { getAccounts } from "@/http/accounts/get";
import { useQuery } from "@tanstack/react-query";
import { DataComponent } from "./_components/data";

const AccountsConfigPage = () => {
	const { data: accounts } = useQuery({
		queryKey: ["get-accounts"],
		queryFn: getAccounts,
	});

	const totalBalance = accounts
		? accounts.reduce(
				(acc: number, account: Account) => acc + account.balance,
				0
			)
		: null;

	return (
		<div className="container flex flex-col gap-4">
			<Header title="Contas" totalBalance={totalBalance} />
			<main>
				<section>
					<DataComponent />
				</section>
			</main>
		</div>
	);
};

export default AccountsConfigPage;
