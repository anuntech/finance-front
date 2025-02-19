import { Actions } from "@/components/actions";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteAccount } from "@/http/accounts/delete";
import { type Account, getAccountById } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import type { Transaction } from "@/http/transactions/get";
import { formatBalance } from "@/utils/format-balance";
import { getFavicon } from "@/utils/get-favicon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { AccountForm } from "./form";

const useDeleteAccountMutation = () => {
	const queryClient = useQueryClient();

	const deleteAccountMutation = useMutation({
		mutationFn: (id: string) => deleteAccount({ id }),
		onSuccess: (_, id: string) => {
			const ids = id.split(",");

			queryClient.setQueryData(["get-accounts"], (accounts: Array<Account>) => {
				const newAccounts = accounts?.filter(
					account => !ids.includes(account.id)
				);

				return newAccounts;
			});
			queryClient.invalidateQueries({ queryKey: ["get-accounts"] });

			toast.success("Conta deletada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar conta: ${message}`);
		},
	});

	return deleteAccountMutation;
};

export const columns: Array<ColumnDef<Transaction>> = [
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
		accessorKey: "accountId",
		header: "Conta",
		cell: ({ row }) => {
			// const {
			// 	data: account,
			// 	isLoading: isLoadingAccount,
			// 	isSuccess: isSuccessAccount,
			// } = useQuery({
			// 	queryKey: ["get-account-by-id"],
			// 	queryFn: () => getAccountById(row.original.accountId),
			// });

			// if (!isSuccessAccount && !isLoadingAccount) {
			// 	toast.error("Erro ao carregar conta");
			// }

			// const {
			// 	data: banks,
			// 	isLoading: isLoadingBanks,
			// 	isSuccess: isSuccessBanks,
			// } = useQuery({
			// 	queryKey: ["get-banks"],
			// 	queryFn: getBanks,
			// });

			// if (!isSuccessBanks && !isLoadingBanks) {
			// 	toast.error("Erro ao carregar bancos");
			// }

			// const bank = banks?.find(bank => bank.id === account?.bankId);
			// const icon = bank ? getFavicon(bank.image) : "";

			return (
				<div className="flex items-center gap-2">
					{/* <Avatar className="h-6 w-6">
						<AvatarImage src={icon} alt={bank?.name.slice(0, 2)} />
						<AvatarFallback>{bank?.name.slice(0, 2)}</AvatarFallback>
					</Avatar>
					<span>{account?.name}</span> */}
					<span
					// className="hidden"
					>
						{row.getValue("accountId")}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "name",
		header: "Nome",
		cell: ({ row }) => {
			return (
				<div>
					<span>{row.getValue("name")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "description",
		header: "Descrição",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("description")}</span>;
		},
	},
	{
		accessorKey: "supplier",
		header: "Fornecedor",
		cell: ({ row }) => {
			return (
				<div>
					<span>{row.getValue("supplier")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "assignedTo",
		header: "Atribuído a",
		cell: ({ row }) => {
			return (
				<div>
					<span>{row.getValue("assignedTo")}</span>
				</div>
			);
		},
	},
	{
		id: "balance.value",
		accessorKey: "balance.value",
		header: "Saldo",
		cell: ({ row }) => {
			const balance = row.original.balance;
			const totalBalance =
				balance.value +
				balance.parts +
				balance.labor -
				balance.discount +
				balance.interest;

			return (
				<div>
					<span>{formatBalance(totalBalance)}</span>
					<span className="hidden">{row.getValue("balance.value")}</span>
				</div>
			);
		},
		footer: ({ table }) => {
			const total = table.getSelectedRowModel().rows.reduce((acc, row) => {
				const balance = row.original.balance;
				const totalBalance =
					balance.value +
					balance.parts +
					balance.labor -
					balance.discount +
					balance.interest;

				return acc + totalBalance;
			}, 0);
			const formattedTotal = formatBalance(total);

			return (
				<div>
					<span>{formattedTotal}</span>
				</div>
			);
		},
	},
	{
		id: "balance.parts",
		accessorKey: "balance.parts",
		header: "Peças",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("balance.parts")}</span>;
		},
	},
	{
		id: "balance.labor",
		accessorKey: "balance.labor",
		header: "Mão de obra",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("balance.labor")}</span>;
		},
	},
	{
		id: "balance.discount",
		accessorKey: "balance.discount",
		header: "Desconto",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("balance.discount")}</span>;
		},
	},
	{
		id: "balance.interest",
		accessorKey: "balance.interest",
		header: "Juros",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("balance.interest")}</span>;
		},
	},
	{
		accessorKey: "dueDate",
		header: "Vencimento",
		cell: ({ row }) => {
			return (
				<div>
					<span>{row.getValue("dueDate")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "categoryId",
		header: "Categoria",
		cell: ({ row }) => {
			return (
				<div>
					<span
					// className="hidden"
					>
						{row.getValue("categoryId")}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "subCategoryId",
		header: "Subcategoria",
		cell: ({ row }) => {
			return (
				<div>
					<span
					// className="hidden"
					>
						{row.getValue("subCategoryId")}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "isConfirmed",
		header: "Confirmado",
		cell: ({ row }) => {
			return (
				<div>
					<span>{row.getValue("isConfirmed") ? "Sim" : "Não"}</span>
					<span className="hidden">{row.getValue("isConfirmed")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "frequency",
		header: "Frequência",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("frequency")}</span>;
		},
	},
	{
		accessorKey: "registrationDate",
		header: "Data de registro",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("registrationDate")}</span>;
		},
	},
	{
		accessorKey: "confirmationDate",
		header: "Data de confirmação",
		enableHiding: false,
		enableSorting: false,
		enableGrouping: false,
		minSize: 0,
		size: 0,
		cell: ({ row }) => {
			return <span className="hidden">{row.getValue("confirmationDate")}</span>;
		},
	},
	{
		id: "actions",
		enableHiding: false,
		enableSorting: false,
		size: 25,
		cell: ({ row }) => {
			const deleteAccountMutation = useDeleteAccountMutation();

			return (
				<div className="flex justify-end">
					<Actions
						handleDelete={deleteAccountMutation}
						dialog={{
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
