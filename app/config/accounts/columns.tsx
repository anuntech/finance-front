import { Actions } from "@/components/actions";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { deleteAccount } from "@/http/accounts/delete";
import type { Account } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { accountsKeys } from "@/queries/keys/accounts";
import { banksKeys } from "@/queries/keys/banks";
import { formatBalance } from "@/utils/format-balance";
import { getFavicon } from "@/utils/get-favicon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { AccountForm } from "./form";

const useDeleteAccountMutation = () => {
	const { month, year } = useDateWithMonthAndYear();

	const queryClient = useQueryClient();

	const deleteAccountMutation = useMutation({
		mutationFn: (id: string) => deleteAccount({ id }),
		onSuccess: (_, id: string) => {
			const ids = id.split(",");

			queryClient.setQueryData(
				accountsKeys.filter({ month, year }),
				(accounts: Array<Account>) => {
					const newAccounts = accounts?.filter(
						account => !ids.includes(account.id)
					);

					return newAccounts;
				}
			);
			queryClient.invalidateQueries({
				queryKey: accountsKeys.filter({ month, year }),
			});

			toast.success("Conta deletada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar conta: ${message}`);
		},
	});

	return deleteAccountMutation;
};

export const columns: Array<ColumnDef<Account>> = [
	{
		id: "select",
		enableSorting: false,
		enableHiding: false,
		size: 25,
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() ? "indeterminate" : false)
				}
				onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<div className="flex max-w-10 items-center justify-start">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={value => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
	},
	{
		accessorKey: "name",
		header: "Nome",
		cell: ({ row }) => {
			const {
				data: banks,
				isLoading: isLoadingBanks,
				isSuccess: isSuccessBanks,
			} = useQuery({
				queryKey: banksKeys.all,
				queryFn: getBanks,
			});

			const bank = banks?.find(bank => bank.id === row.original.bankId);
			const icon = bank ? getFavicon(bank.image) : "";

			useEffect(() => {
				if (!isSuccessBanks && !isLoadingBanks) {
					toast.error("Erro ao carregar bancos");
				}

				if (banks && !bank) {
					toast.error("Erro ao carregar banco");
				}
			}, [isLoadingBanks, isSuccessBanks, bank, banks]);

			return (
				<div className="flex items-center gap-2">
					{isLoadingBanks || !isSuccessBanks || !bank ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6 rounded-full" />
						</div>
					) : (
						<>
							<Avatar className="h-6 w-6">
								<AvatarImage src={icon} alt={bank?.name.slice(0, 2)} />
								<AvatarFallback>{bank?.name.slice(0, 2)}</AvatarFallback>
							</Avatar>
						</>
					)}
					<span>{row.getValue("name")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "currentBalance",
		header: "Saldo Atual",
		cell: ({ row }) => {
			return (
				<div>
					<span>{formatBalance(row.getValue("currentBalance"))}</span>
				</div>
			);
		},
		footer: ({ table }) => {
			const total = table
				.getSelectedRowModel()
				.rows.reduce(
					(acc, row) => acc + Number(row.getValue("currentBalance")),
					0
				);

			const formattedTotal = formatBalance(total);

			return (
				<div>
					<span>{formattedTotal}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "balance",
		header: "Saldo Previsto",
		cell: ({ row }) => {
			return (
				<div>
					<span>{formatBalance(row.getValue("balance"))}</span>
				</div>
			);
		},
		footer: ({ table }) => {
			const total = table
				.getSelectedRowModel()
				.rows.reduce((acc, row) => acc + Number(row.getValue("balance")), 0);

			const formattedTotal = formatBalance(total);

			return (
				<div>
					<span>{formattedTotal}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "bankId",
		header: "Banco",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("bankId")}</span>;
		},
	},
	{
		id: "actions",
		enableHiding: false,
		enableSorting: false,
		minSize: 100,
		size: 100,
		cell: ({ row }) => {
			const deleteAccountMutation = useDeleteAccountMutation();

			return (
				<div className="flex justify-end">
					<Actions
						handleDelete={deleteAccountMutation}
						details={{
							title: "Editar conta",
							description: "Edite a conta para atualizar suas informações",
						}}
						FormData={AccountForm}
						id={row.original.id}
					/>
				</div>
			);
		},
		footer: ({ table }) => {
			const deleteAccountMutation = useDeleteAccountMutation();

			const ids = table
				.getFilteredSelectedRowModel()
				.rows.map(row => row.original.id);
			const idsString = ids.join(",");

			return (
				<div className="flex justify-end">
					{ids.length > 0 && (
						<Actions handleDelete={deleteAccountMutation} id={idsString} />
					)}
				</div>
			);
		},
	},
];
