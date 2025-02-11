"use client";
import { Actions } from "@/components/actions";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { deleteAccount } from "@/http/accounts/delete";
import type { Account } from "@/http/accounts/get";
import { Bank, getBanks } from "@/http/banks/get";
import { formatBalance } from "@/utils/format-balance";
import { getFavicon } from "@/utils/get-favicon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import toast from "react-hot-toast";
import { AccountForm } from "./form";

export const columns: Array<ColumnDef<Account>> = [
	{
		accessorKey: "name",
		header: "Nome",
		cell: ({ row }) => {
			const {
				data: banks,
				isLoading: isLoadingBanks,
				isSuccess: isSuccessBanks,
			} = useQuery({
				queryKey: ["get-banks"],
				queryFn: getBanks,
			});

			if (!isSuccessBanks && !isLoadingBanks) {
				toast.error("Erro ao carregar bancos");
			}

			const bank = banks?.find(bank => bank.id === row.original.bankId);
			const icon = bank ? getFavicon(bank.image) : "";

			return (
				<div className="flex items-center gap-2">
					<Avatar className="h-6 w-6">
						<AvatarImage src={icon} alt={bank?.name.slice(0, 2)} />
						<AvatarFallback>{bank?.name.slice(0, 2)}</AvatarFallback>
					</Avatar>
					{row.getValue("name")}
				</div>
			);
		},
	},
	{
		accessorKey: "balance",
		header: "Saldo",
		cell: ({ row }) => {
			return <span>{formatBalance(row.original.balance)}</span>;
		},
	},
	{
		id: "bank",
		accessorKey: "bankId",
		enableHiding: false,
		enableSorting: false,
		cell: () => {
			return <></>;
		},
	},
	{
		id: "actions",
		enableHiding: false,
		enableSorting: false,
		cell: ({ row }) => {
			const [editDialogIsOpen, setEditDialogIsOpen] = useState(false);

			const queryClient = useQueryClient();

			const deleteAccountMutation = useMutation({
				mutationFn: () => deleteAccount({ id: row.original.id }),
				onSuccess: () => {
					queryClient.setQueryData(
						["get-accounts"],
						(accounts: Array<Account>) => {
							const newAccounts = accounts?.filter(
								account => account.id !== row.original.id
							);

							return newAccounts;
						}
					);
					queryClient.invalidateQueries({ queryKey: ["get-accounts"] });

					setEditDialogIsOpen(false);

					toast.success("Conta deletada com sucesso");
				},
				onError: ({ message }) => {
					toast.error(`Erro ao deletar conta: ${message}`);
				},
			});

			return (
				<Actions
					editDialogIsOpen={editDialogIsOpen}
					setEditDialogIsOpen={setEditDialogIsOpen}
					handleDelete={deleteAccountMutation}
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
