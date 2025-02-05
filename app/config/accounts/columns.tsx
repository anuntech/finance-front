"use client";
import { Actions } from "@/components/actions";
import type { Account } from "@/http/accounts/get";
import { formatBalance } from "@/utils/format-balance";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { AccountForm } from "./form";

export const columns: Array<ColumnDef<Account>> = [
	{
		accessorKey: "name",
		header: "Nome",
		cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
	},
	{
		accessorKey: "balance",
		header: "Saldo",
		cell: ({ row }) => {
			return <span>{formatBalance(row.original.balance)}</span>;
		},
	},
	{
		id: "actions",
		enableHiding: false,
		enableSorting: false,
		cell: ({ row }) => {
			const queryClient = useQueryClient();

			const handleDelete = () => {
				const accounts = queryClient.getQueryData<Array<Account>>([
					"get-accounts",
				]);
				const newAccounts = accounts?.filter(
					account => account.id !== row.original.id
				);

				queryClient.setQueryData(["get-accounts"], newAccounts);

				return {
					isSuccess: true,
					message: "Conta deletada com sucesso",
				};
			};

			return (
				<Actions
					handleDelete={handleDelete}
					dialog={{
						title: "Editar conta",
						description: "Edite a conta para atualizar suas informações",
					}}
					FormData={AccountForm}
					id={row.original.id}
				/>
			);
		},
	},
];
