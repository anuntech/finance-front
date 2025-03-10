import { Actions } from "@/components/actions";
import { IconComponent } from "@/components/get-lucide-icon";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignments } from "@/hooks/assignments";
import { getAccountById } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { getCategoryById } from "@/http/categories/get";
import { deleteTransaction } from "@/http/transactions/delete";
import {
	type Transaction,
	type TransactionWithTagsAndSubTags,
	getTransactions,
} from "@/http/transactions/get";
import { api } from "@/libs/api";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { formatBalance } from "@/utils/format-balance";
import { getFavicon } from "@/utils/get-favicon";
import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { sub } from "date-fns";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TransactionsForm } from "./form";

dayjs.locale(ptBR);

const SkeletonCategory = () => (
	<div className="flex items-center gap-2">
		<Skeleton className="h-6 w-6 rounded-full" />
		<Skeleton className="h-4 w-20" />
	</div>
);

const NotInformed = () => (
	<span className="text-red-500 text-xs">Não informado</span>
);

const useDeleteTransactionMutation = () => {
	const queryClient = useQueryClient();

	const deleteTransactionMutation = useMutation({
		mutationFn: (id: string) => deleteTransaction({ id }),
		onSuccess: (_, id: string) => {
			const ids = id.split(",");

			queryClient.setQueryData(
				["get-transactions"],
				(transactions: Array<Transaction>) => {
					const newTransactions = transactions?.filter(
						transaction => !ids.includes(transaction.id)
					);

					return newTransactions;
				}
			);
			queryClient.invalidateQueries({ queryKey: ["get-transactions"] });

			toast.success("Transação deletada com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar transação: ${message}`);
		},
	});

	return deleteTransactionMutation;
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

export const columns: Array<ColumnDef<TransactionWithTagsAndSubTags>> = [
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
		size: 100,
		maxSize: 100,
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
			if (!row.original.accountId) {
				return (
					<div>
						<NotInformed />
						<span className="hidden">{row.original.accountId}</span>
					</div>
				);
			}

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
		header: "Número do documento",
		size: 250,
		maxSize: 250,
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
		header: "Observação",
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
					{row.original.supplier ? (
						<span>{row.getValue("supplier")}</span>
					) : (
						<NotInformed />
					)}
					<span className="hidden">{row.getValue("supplier")}</span>
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
			const balance = row.original.balance.value;

			const balanceDiscountPercentage = row.original.balance.discountPercentage;
			const balanceDiscount = row.original.balance.discount;
			const balanceInterest = row.original.balance.interest;
			const balanceInterestPercentage = row.original.balance.interestPercentage;

			let discount = row.original.balance.discount ?? 0;
			let interest = row.original.balance.interest ?? 0;

			if (balanceDiscountPercentage) {
				discount = (balance * (balanceDiscountPercentage ?? 0)) / 100;
			}

			if (balanceInterestPercentage) {
				interest = (balance * (balanceInterestPercentage ?? 0)) / 100;
			}

			const liquidValue = balance - discount + interest;

			return (
				<div>
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button type="button">
									<span>{formatBalance(liquidValue)}</span>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem>
									<span>Valor:</span>
									<span>{formatBalance(balance)}</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Desconto:</span>
									<span>
										{balanceDiscount || balanceDiscountPercentage
											? balanceDiscount
												? formatBalance(balanceDiscount)
												: `${balanceDiscountPercentage}%`
											: 0}
									</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Juros:</span>
									<span>
										{balanceInterest || balanceInterestPercentage
											? balanceInterest
												? formatBalance(balanceInterest)
												: `${balanceInterestPercentage}%`
											: 0}
									</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<span>Total:</span>
									<span>{formatBalance(liquidValue)}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<span className="hidden">{row.getValue("balance.value")}</span>
				</div>
			);
		},
		footer: ({ table }) => {
			const total = table.getSelectedRowModel().rows.reduce((acc, row) => {
				const balance = row.original.balance.value;

				const balanceDiscountPercentage =
					row.original.balance.discountPercentage;
				const balanceInterestPercentage =
					row.original.balance.interestPercentage;

				let discount = row.original.balance.discount ?? 0;
				let interest = row.original.balance.interest ?? 0;

				if (balanceDiscountPercentage) {
					discount = (balance * (balanceDiscountPercentage ?? 0)) / 100;
				}

				if (balanceInterestPercentage) {
					interest = (balance * (balanceInterestPercentage ?? 0)) / 100;
				}

				const liquidValue = balance - discount + interest;

				return acc + liquidValue;
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
		// invoice
		accessorKey: "invoice",
		header: "Nota fiscal",
		cell: ({ row }) => {
			return (
				<div>
					{row.original.invoice ? (
						<span>{row.original.invoice}</span>
					) : (
						<span className="text-red-500 text-xs">Não informado</span>
					)}
					<span className="hidden">{row.getValue("invoice")}</span>
				</div>
			);
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
						<SkeletonCategory />
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
						<SkeletonCategory />
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
		// tags
		accessorKey: "tags",
		header: "Etiqueta",
		cell: ({ row }) => {
			const tagsWithoutSubTags = row.original.tags.filter(
				tag => tag.subTagId === "000000000000000000000000"
			);

			const hasTags = tagsWithoutSubTags.length > 0;

			if (!hasTags) {
				return (
					<div className="flex items-center gap-2">
						<NotInformed />
						{/* <span className="hidden">{row.getValue("tags")}</span> */}
					</div>
				);
			}

			const tagIds = tagsWithoutSubTags.map(tag => tag.tagId);

			const tagsQueries = useQueries({
				queries: tagIds.map(tagId => ({
					queryKey: [`get-category-by-id-${tagId}`],
					queryFn: () => getCategoryById(tagId),
				})),
			});

			const isLoading = tagsQueries.some(query => query.isLoading);
			const isSuccess = tagsQueries.every(query => query.isSuccess);

			if (!isLoading && !isSuccess) {
				toast.error("Erro ao carregar etiqueta");
			}

			return (
				<div className="flex items-center gap-2">
					{isLoading ? (
						<SkeletonCategory />
					) : (
						<>
							<DropdownMenu>
								<DropdownMenuTrigger>Visualizar</DropdownMenuTrigger>
								<DropdownMenuContent>
									<ScrollArea className="h-full max-h-48 overflow-y-auto">
										{tagsQueries.map(tag => (
											<DropdownMenuItem key={tag.data?.id}>
												<div className="flex items-center gap-2">
													<IconComponent name={tag?.data?.icon} />
													<span>{tag?.data?.name}</span>
												</div>
											</DropdownMenuItem>
										))}
									</ScrollArea>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					)}
				</div>
			);
		},
	},
	{
		// subTags
		accessorKey: "subTags",
		header: "Sub etiqueta",
		cell: ({ row }) => {
			const tagsWithSubTags = row.original.tags.filter(
				tag => tag.subTagId !== "000000000000000000000000"
			);

			const hasSubTags = tagsWithSubTags.length > 0;

			if (!hasSubTags) {
				return (
					<div className="flex items-center gap-2">
						<NotInformed />
						{/* <span className="hidden">{row.getValue("tags")}</span> */}
					</div>
				);
			}

			const categoriesQueries = useQueries({
				queries: tagsWithSubTags.map(tag => ({
					queryKey: ["category", tag.tagId],
					queryFn: () => getCategoryById(tag.tagId),
				})),
			});

			const isLoading = categoriesQueries.some(query => query.isLoading);
			const isSuccess = categoriesQueries.every(query => query.isSuccess);

			if (!isLoading && !isSuccess) {
				toast.error("Erro ao carregar sub etiqueta");
			}

			const subTags: Array<{
				id: string;
				name: string;
				icon: string;
			}> = [];

			categoriesQueries.forEach((query, index) => {
				if (query.isSuccess) {
					const tag = tagsWithSubTags[index];
					const categoryData = query.data;

					const subCategory = categoryData?.subCategories?.find(
						subCategory => subCategory.id === tag.subTagId
					);

					if (categoryData && !subCategory) {
						toast.error("Erro ao carregar sub etiqueta");

						return;
					}

					if (subCategory) {
						subTags.push({
							id: subCategory.id,
							name: subCategory.name,
							icon: subCategory.icon,
						});
					}
				}
			});

			return (
				<div className="flex items-center gap-2">
					{subTags.length === 0 ? (
						<SkeletonCategory />
					) : (
						<>
							<DropdownMenu>
								<DropdownMenuTrigger>Visualizar</DropdownMenuTrigger>
								<DropdownMenuContent>
									<ScrollArea className="h-full max-h-48 overflow-y-auto">
										{subTags.map(subTag => (
											<DropdownMenuItem key={subTag.id}>
												<div className="flex items-center gap-2">
													<IconComponent name={subTag?.icon} />
													<span>{subTag?.name}</span>
												</div>
											</DropdownMenuItem>
										))}
									</ScrollArea>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					)}
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
			const deleteTransactionMutation = useDeleteTransactionMutation();

			const transactionType = row.original.type;
			const details =
				transactionType === TRANSACTION_TYPE.RECIPE
					? detailsOptions.recipe
					: detailsOptions.expense;

			return (
				<div className="flex justify-center">
					<Actions
						handleDelete={deleteTransactionMutation}
						details={details}
						FormData={TransactionsForm}
						editDialogProps={{
							dialogContent: {
								className: "max-w-[80dvh] overflow-y-auto",
							},
						}}
						id={row.original.id}
						transactionType={transactionType}
					/>
				</div>
			);
		},
		footer: ({ table }) => {
			const deleteTransactionMutation = useDeleteTransactionMutation();

			const ids = table
				.getFilteredSelectedRowModel()
				.rows.map(row => row.original.id);
			const idsString = ids.join(",");

			return (
				<div className="flex justify-end">
					{ids.length > 0 && (
						<Actions handleDelete={deleteTransactionMutation} id={idsString} />
					)}
				</div>
			);
		},
	},
];
