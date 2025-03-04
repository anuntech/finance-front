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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
			const balance = row.original.balance;
			const grossValue =
				(balance.value ?? 0) + (balance.parts ?? 0) + (balance.labor ?? 0);
			const discountPercentageCalculated =
				(grossValue * (balance.discountPercentage ?? 0)) / 100;
			const interestPercentageCalculated =
				(grossValue * (balance.interestPercentage ?? 0)) / 100;
			const liquidValue =
				grossValue -
				(balance.discount ?? 0) -
				discountPercentageCalculated +
				(balance.interest ?? 0) +
				interestPercentageCalculated;

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
								<DropdownMenuLabel>Bruto</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<span>Valor:</span>
									<span>{formatBalance(balance.value)}</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Peças:</span>
									<span>{formatBalance(balance.parts ?? 0)}</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Mão de obra:</span>
									<span>{formatBalance(balance.labor ?? 0)}</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Total bruto:</span>
									<span>{formatBalance(grossValue)}</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Liquido</DropdownMenuLabel>
								<DropdownMenuItem>
									<span>Desconto:</span>
									<span>{formatBalance(balance.discount)}</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Desconto (%):</span>
									<span>{discountPercentageCalculated}%</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Juros:</span>
									<span>{formatBalance(balance.interest)}</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Juros (%):</span>
									<span>{interestPercentageCalculated}%</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Total líquido:</span>
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
				const balance = row.original.balance;
				const totalBalance =
					balance.value +
					(balance.parts || 0) +
					(balance.labor || 0) -
					(balance.discount || 0) +
					(balance.interest || 0);

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
			const [tags, setTags] = useState<
				Array<{
					id: string;
					name: string;
					icon: string;
				}>
			>([]);

			if (row.original.tags.length === 0) {
				return (
					<div className="flex items-center gap-2">
						<NotInformed />
						{/* <span className="hidden">{row.getValue("tagId")}</span> */}
					</div>
				);
			}

			useEffect(() => {
				const getTags = async () => {
					const tags: Array<{
						id: string;
						name: string;
						icon: string;
					}> = [];

					for (const tag of row.original.tags.filter(
						tag => tag.subTagId === "000000000000000000000000"
					)) {
						const { tagId } = tag;

						const categoryById = await getCategoryById(tagId);

						const tagById = {
							id: tagId,
							name: categoryById.name,
							icon: categoryById.icon,
						};

						tags.push(tagById);
					}

					setTags(tags);
				};

				getTags();
			}, [row.original.tags]);

			return (
				<div className="flex items-center gap-2">
					{tags.length === 0 ? (
						<SkeletonCategory />
					) : (
						<>
							<DropdownMenu>
								<DropdownMenuTrigger>Visualizar</DropdownMenuTrigger>
								<DropdownMenuContent>
									<ScrollArea className="h-full max-h-48 overflow-y-auto">
										{tags.map(tag => (
											<DropdownMenuItem key={tag.id}>
												<div className="flex items-center gap-2">
													<IconComponent name={tag?.icon} />
													<span>{tag?.name}</span>
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
			const [subTags, setSubTags] = useState<
				Array<{
					id: string;
					name: string;
					icon: string;
				}>
			>([]);

			const hasSubTags = row.original.tags.some(
				tag => tag.subTagId !== "000000000000000000000000"
			);

			if (row.original.tags.length === 0 || !hasSubTags) {
				return (
					<div className="flex items-center gap-2">
						<NotInformed />
						{/* <span className="hidden">{row.getValue("subTagId")}</span> */}
					</div>
				);
			}

			useEffect(() => {
				const getSubTags = async () => {
					const subTags: Array<{
						id: string;
						name: string;
						icon: string;
					}> = [];

					for (const tag of row.original.tags.filter(
						tag => tag.subTagId !== "000000000000000000000000"
					)) {
						const { tagId, subTagId } = tag;

						const categoryById = await getCategoryById(tagId);

						const subCategory = categoryById?.subCategories?.find(
							subCategory => subCategory.id === subTagId
						);

						if (categoryById && !subCategory) {
							toast.error("Erro ao carregar sub etiqueta");
						}

						const subTag = {
							id: subCategory.id,
							name: subCategory.name,
							icon: subCategory.icon,
						};

						subTags.push(subTag);
					}

					setSubTags(subTags);
				};

				getSubTags();
			}, [row.original.tags]);

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
