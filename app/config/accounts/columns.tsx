"use client";
import { Actions } from "@/components/actions";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import type { Account } from "@/http/accounts/get";
import { formatBalance } from "@/utils/format-balance";
import { getFavicon } from "@/utils/get-favicon";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { AccountForm } from "./form";

export const columns: Array<ColumnDef<Account>> = [
	{
		accessorKey: "name",
		header: "Nome",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Avatar className="h-4 w-4">
					<AvatarImage
						src={getFavicon(row.original.icon.href)}
						alt={row.original.name}
					/>
					<AvatarFallback>{row.original.icon.name}</AvatarFallback>
				</Avatar>
				{row.getValue("name")}
			</div>
		),
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
				queryClient.setQueryData(
					["get-accounts"],
					(accounts: Array<Account>) => {
						const newAccounts = accounts?.filter(
							account => account.id !== row.original.id
						);

						return newAccounts;
					}
				);

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
