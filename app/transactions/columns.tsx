import { Actions } from "@/components/actions";
import { IconComponent } from "@/components/get-lucide-icon";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignments } from "@/hooks/assignments";
import { deleteAccount } from "@/http/accounts/delete";
import { type Account, getAccountById } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { getCategoryById } from "@/http/categories/get";
import type { Transaction } from "@/http/transactions/get";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { formatBalance } from "@/utils/format-balance";
import { getFavicon } from "@/utils/get-favicon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { TransactionsForm } from "./form";

dayjs.locale(ptBR);

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

const detailsOptions = {
	recipe: {
		title: "Editar transação",
		description: "Edite a transação para atualizar suas informações",
	},
	expense: {
		title: "Editar despesa",
		description: "Edite a despesa para atualizar suas informações",
	},
};

export const columns: Array<ColumnDef<Transaction>> = [
	{
		// select
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
		// type
		accessorKey: "type",
		header: "Tipo",
		cell: ({ row }) => {
			const transactionType = row.original.type;

			return (
				<div>
					<span>
						{transactionType === TRANSACTION_TYPE.RECIPE
							? "Receita"
							: "Despesa"}
					</span>
					<span className="hidden">{transactionType}</span>
				</div>
			);
		},
	},
	{
		// accountId
		accessorKey: "accountId",
		header: "Conta",
		cell: ({ row }) => {
			const {
				data: accountById,
				isLoading: isLoadingAccountById,
				isSuccess: isSuccessAccountById,
			} = useQuery({
				queryKey: [`get-account-by-id-${row.original.accountId}`],
				queryFn: () => getAccountById(row.original.accountId),
			});

			if (!isSuccessAccountById && !isLoadingAccountById) {
				toast.error("Erro ao carregar conta");
			}

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

			const bank = banks?.find(bank => bank.id === accountById?.bankId);
			const icon = bank ? getFavicon(bank.image) : "";

			return (
				<div className="flex items-center gap-2">
					{isLoadingAccountById ||
					!isSuccessAccountById ||
					isLoadingBanks ||
					!isSuccessBanks ||
					!bank ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>
					) : (
						<>
							<Avatar className="h-6 w-6">
								<AvatarImage src={icon} alt={bank?.name.slice(0, 2)} />
								<AvatarFallback>{bank?.name.slice(0, 2)}</AvatarFallback>
							</Avatar>
							<span>{accountById?.name}</span>
						</>
					)}
					<span className="hidden">{row.getValue("accountId")}</span>
				</div>
			);
		},
	},
	{
		// name
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
		// description
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
		// assignedTo
		accessorKey: "assignedTo",
		header: "Atribuído a",
		cell: ({ row }) => {
			const workspaceId =
				typeof window !== "undefined"
					? localStorage.getItem("workspaceId")
					: "";

			const { assignments, isLoadingAssignments, isSuccessAssignments } =
				useAssignments(workspaceId);

			const assigned = assignments.find(
				assignment => assignment.id === row.original.assignedTo
			);

			return (
				<div className="flex items-center gap-2">
					{isLoadingAssignments || !isSuccessAssignments || !assigned ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>
					) : (
						<>
							<Avatar className="h-6 w-6">
								<AvatarImage src={assigned.image} alt={assigned.name} />
								<AvatarFallback>{assigned.name.slice(0, 2)}</AvatarFallback>
							</Avatar>
							<span>{assigned.name}</span>
						</>
					)}
					<span className="hidden">{row.getValue("accountId")}</span>
				</div>
			);
		},
	},
	{
		// supplier
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
		// balance.value
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
		// balance.parts
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
		// balance.labor
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
		// balance.discount
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
		// balance.interest
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
		// dueDate
		accessorKey: "dueDate",
		header: "Vencimento",
		cell: ({ row }) => {
			const dateFormatted = dayjs(row.original.dueDate).format("DD/MM/YYYY");

			return (
				<div>
					<span>{dateFormatted}</span>
					<span className="hidden">{row.getValue("dueDate")}</span>
				</div>
			);
		},
	},
	{
		// categoryId
		accessorKey: "categoryId",
		header: "Categoria",
		cell: ({ row }) => {
			const {
				data: categoryById,
				isLoading: isLoadingCategoryById,
				isSuccess: isSuccessCategoryById,
			} = useQuery({
				queryKey: [`get-category-by-id-${row.original.categoryId}`],
				queryFn: () => getCategoryById(row.original.categoryId),
			});

			useEffect(() => {
				if (!isSuccessCategoryById && !isLoadingCategoryById) {
					toast.error("Erro ao carregar categoria");
				}
			}, [isLoadingCategoryById, isSuccessCategoryById]);

			return (
				<div className="flex items-center gap-2">
					{isLoadingCategoryById || !isSuccessCategoryById ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>
					) : (
						<div className="flex items-center gap-2">
							<IconComponent name={categoryById?.icon} />
							<span>{categoryById?.name}</span>
						</div>
					)}
					<span className="hidden">{row.getValue("categoryId")}</span>
				</div>
			);
		},
	},
	{
		// subCategoryId
		accessorKey: "subCategoryId",
		header: "Subcategoria",
		cell: ({ row }) => {
			const {
				data: categoryById,
				isLoading: isLoadingCategoryById,
				isSuccess: isSuccessCategoryById,
			} = useQuery({
				queryKey: [`get-category-by-id-${row.original.categoryId}`],
				queryFn: () => getCategoryById(row.original.categoryId),
			});

			const subCategory = categoryById?.subCategories?.find(
				subCategory => subCategory.id === row.original.subCategoryId
			);

			useEffect(() => {
				if (!isSuccessCategoryById && !isLoadingCategoryById) {
					toast.error("Erro ao carregar categoria");
				}

				if (categoryById && !subCategory) {
					toast.error("Erro ao carregar subcategoria");
				}
			}, [
				categoryById,
				subCategory,
				isLoadingCategoryById,
				isSuccessCategoryById,
			]);

			return (
				<div className="flex items-center gap-2">
					{isLoadingCategoryById || !isSuccessCategoryById || !subCategory ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>
					) : (
						<div className="flex items-center gap-2">
							<IconComponent name={subCategory?.icon} />
							<span>{subCategory?.name}</span>
						</div>
					)}
					<span className="hidden">{row.getValue("subCategoryId")}</span>
				</div>
			);
		},
	},
	{
		// tagId
		accessorKey: "tagId",
		header: "Etiqueta",
		cell: ({ row }) => {
			const {
				data: categoryById,
				isLoading: isLoadingCategoryById,
				isSuccess: isSuccessCategoryById,
			} = useQuery({
				queryKey: [`get-category-by-id-${row.original.tagId}`],
				queryFn: () => getCategoryById(row.original.tagId),
			});

			useEffect(() => {
				if (!isSuccessCategoryById && !isLoadingCategoryById) {
					toast.error("Erro ao carregar etiqueta");
				}
			}, [isLoadingCategoryById, isSuccessCategoryById]);

			return (
				<div className="flex items-center gap-2">
					{isLoadingCategoryById || !isSuccessCategoryById ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>
					) : (
						<div className="flex items-center gap-2">
							<IconComponent name={categoryById?.icon} />
							<span>{categoryById?.name}</span>
						</div>
					)}
					<span className="hidden">{row.getValue("tagId")}</span>
				</div>
			);
		},
	},
	{
		// subTagId
		accessorKey: "subTagId",
		header: "Sub etiqueta",
		cell: ({ row }) => {
			const {
				data: categoryById,
				isLoading: isLoadingCategoryById,
				isSuccess: isSuccessCategoryById,
			} = useQuery({
				queryKey: [`get-category-by-id-${row.original.tagId}`],
				queryFn: () => getCategoryById(row.original.tagId),
			});

			const subCategory = categoryById?.subCategories?.find(
				subCategory => subCategory.id === row.original.subTagId
			);

			useEffect(() => {
				if (!isSuccessCategoryById && !isLoadingCategoryById) {
					toast.error("Erro ao carregar etiqueta");
				}

				if (categoryById && !subCategory) {
					toast.error("Erro ao carregar sub etiqueta");
				}
			}, [
				categoryById,
				subCategory,
				isLoadingCategoryById,
				isSuccessCategoryById,
			]);

			return (
				<div className="flex items-center gap-2">
					{isLoadingCategoryById || !isSuccessCategoryById || !subCategory ? (
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-6 rounded-full" />
							<Skeleton className="h-4 w-20" />
						</div>
					) : (
						<div className="flex items-center gap-2">
							<IconComponent name={subCategory?.icon} />
							<span>{subCategory?.name}</span>
						</div>
					)}
					<span className="hidden">{row.getValue("subTagId")}</span>
				</div>
			);
		},
	},
	{
		// isConfirmed
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
		// frequency
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
		// registrationDate
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
		// confirmationDate
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
		// actions
		id: "actions",
		enableHiding: false,
		enableSorting: false,
		minSize: 100,
		size: 100,
		cell: ({ row }) => {
			const deleteAccountMutation = useDeleteAccountMutation();

			const transactionType = row.original.type;
			const details =
				transactionType === TRANSACTION_TYPE.RECIPE
					? detailsOptions.recipe
					: detailsOptions.expense;

			return (
				<div className="flex justify-center">
					<Actions
						handleDelete={deleteAccountMutation}
						details={details}
						FormData={TransactionsForm}
						id={row.original.id}
						transactionType={transactionType}
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
