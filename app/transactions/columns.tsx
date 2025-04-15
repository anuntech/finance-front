import { CheckboxWithFilterArrIncludesSomeOnSubTags } from "@/app/transactions/_components/checkbox-with-filter-arr-includes-some-on-sub-tags";
import { Actions } from "@/components/actions";
import { CheckboxWithFilterArrIncludesSome } from "@/components/checkbox-with-filter-arr-includes-some";
import { IconComponent } from "@/components/get-lucide-icon";
import { LoadingCommands } from "@/components/loading-commands";
import { NotInformed } from "@/components/not-informed";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { CommandGroup } from "@/components/ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useSearch } from "@/contexts/search";
import { useAssignments } from "@/hooks/assignments";
import { getAccountById, getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { getCategories, getCategoryById } from "@/http/categories/get";
import type { CustomField } from "@/http/custom-fields/get";
import { deleteTransaction } from "@/http/transactions/delete";
import type {
	Transaction,
	TransactionWithTagsAndSubTags,
} from "@/http/transactions/get";
import { cn } from "@/lib/utils";
import { accountsKeys } from "@/queries/keys/accounts";
import { banksKeys } from "@/queries/keys/banks";
import { categoriesKeys } from "@/queries/keys/categories";
import { transactionsKeys } from "@/queries/keys/transactions";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import { DATE_TYPE } from "@/types/enums/date-type";
import { FREQUENCY } from "@/types/enums/frequency";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { FilterForDate } from "@/utils/filter-for-date";
import { formatBalance } from "@/utils/format-balance";
import { getFavicon } from "@/utils/get-favicon";
import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { Column, ColumnDef, Table } from "@tanstack/react-table";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";
import { TransactionsForm } from "./form";
import { getCustomFieldFilter } from "./form/_utils/get-custom-field-filter";

dayjs.locale(ptBR);

const SkeletonCategory = () => (
	<div className="flex items-center gap-2">
		<Skeleton className="h-6 w-6 rounded-full" />
		<Skeleton className="h-4 w-20" />
	</div>
);

const NotConfirmed = () => (
	<span className="text-red-500 text-xs">Não confirmada</span>
);

const useDeleteTransactionMutation = () => {
	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();

	const queryClient = useQueryClient();

	const deleteTransactionMutation = useMutation({
		mutationFn: (id: string) => deleteTransaction({ id }),
		onSuccess: (_, id: string) => {
			const ids = id.split(",");

			queryClient.setQueryData(
				transactionsKeys.filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
					search,
				}),
				(transactions: Array<Transaction>) => {
					const newTransactions = transactions?.filter(
						transaction => !ids.includes(transaction.id)
					);

					return newTransactions;
				}
			);
			queryClient.invalidateQueries({
				queryKey: transactionsKeys.filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
					search,
				}),
			});

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

interface Tag {
	tagId: string;
	subTagId: string;
}
interface SubTag {
	id: string;
	name: string;
	icon: string;
}

export const getColumns = (customFields: Array<CustomField>) => {
	const columns: Array<ColumnDef<TransactionWithTagsAndSubTags>> = [
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
			filterFn: "arrIncludesSome",
			meta: {
				headerName: "Tipo",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					return (
						<Command>
							<CommandInput placeholder="Pesquisar tipo..." />
							<CommandEmpty>Nenhum tipo encontrado</CommandEmpty>
							<CommandList>
								<CommandGroup heading="Tipos">
									{Object.values(TRANSACTION_TYPE)
										.filter(type => type !== TRANSACTION_TYPE.ALL)
										.map(type => {
											return (
												<CommandItem key={type}>
													<CheckboxWithFilterArrIncludesSome
														value={type}
														column={column}
													/>
													<label
														htmlFor={type}
														className="flex w-full items-center gap-2"
													>
														<span>
															{type === TRANSACTION_TYPE.RECIPE
																? "Receita"
																: "Despesa"}
														</span>
													</label>
												</CommandItem>
											);
										})}
								</CommandGroup>
							</CommandList>
						</Command>
					);
				},
			},
			header: "Tipo",
			cell: ({ row }) => {
				const transactionType = row.original.type;

				return (
					<div>
						<span
							className={cn(
								transactionType === TRANSACTION_TYPE.RECIPE
									? "text-green-500"
									: "text-red-500"
							)}
						>
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
			// registrationDate
			accessorKey: "registrationDate",
			filterFn: "arrIncludesSome",
			meta: {
				headerName: "Competência",
				filter: ({
					column,
					table,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => (
					<FilterForDate
						column={column}
						table={table}
						dateType={DATE_TYPE.REGISTRATION}
					/>
				),
			},
			header: "Competência",
			cell: ({ column, row }) => {
				const { dateType } = useDateType();

				const dateFormatted = dayjs(row.original.registrationDate).format(
					"DD/MM/YYYY"
				);

				useEffect(() => {
					if (dateType === DATE_TYPE.REGISTRATION && !column.getIsSorted()) {
						column.toggleSorting(true, false);

						return;
					}

					if (dateType !== DATE_TYPE.REGISTRATION && column.getIsSorted()) {
						column.clearSorting();

						return;
					}
				}, [column.getIsSorted, column, dateType]);

				return (
					<div>
						<span>{dateFormatted}</span>
						<span className="hidden">{row.getValue("registrationDate")}</span>
					</div>
				);
			},
		},
		{
			// dueDate
			accessorKey: "dueDate",
			filterFn: "arrIncludesSome",
			meta: {
				headerName: "Vencimento",
				filter: ({
					column,
					table,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => (
					<FilterForDate
						column={column}
						table={table}
						dateType={DATE_TYPE.DUE}
					/>
				),
			},
			header: "Vencimento",
			cell: ({ column, row }) => {
				const { dateType } = useDateType();

				const dateFormatted = dayjs(row.original.dueDate).format("DD/MM/YYYY");

				useEffect(() => {
					if (dateType === DATE_TYPE.DUE && !column.getIsSorted()) {
						column.toggleSorting(true, false);

						return;
					}

					if (dateType !== DATE_TYPE.DUE && column.getIsSorted()) {
						column.clearSorting();

						return;
					}
				}, [column.getIsSorted, column, dateType]);

				return (
					<div>
						<span>{dateFormatted}</span>
						<span className="hidden">{row.getValue("dueDate")}</span>
					</div>
				);
			},
		},

		{
			// confirmationDate
			accessorKey: "confirmationDate",
			filterFn: "arrIncludesSome",
			meta: {
				headerName: "Confirmação",
				filter: ({
					column,
					table,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => (
					<FilterForDate
						column={column}
						table={table}
						dateType={DATE_TYPE.CONFIRMATION}
					/>
				),
			},
			header: "Confirmação",
			cell: ({ column, row }) => {
				const { dateType } = useDateType();

				useEffect(() => {
					if (dateType === DATE_TYPE.CONFIRMATION && !column.getIsSorted()) {
						column.toggleSorting(true, false);

						return;
					}

					if (dateType !== DATE_TYPE.CONFIRMATION && column.getIsSorted()) {
						column.clearSorting();

						return;
					}
				}, [column.getIsSorted, column, dateType]);

				if (!row.original.confirmationDate) {
					return (
						<div>
							<NotConfirmed />
							<span className="hidden">{row.getValue("confirmationDate")}</span>
						</div>
					);
				}

				const dateFormatted = dayjs(row.original.confirmationDate).format(
					"DD/MM/YYYY"
				);

				return (
					<div>
						<span>{dateFormatted}</span>
						<span className="hidden">{row.getValue("confirmationDate")}</span>
					</div>
				);
			},
		},
		{
			// accountId
			accessorKey: "accountId",
			filterFn: "arrIncludesSome",
			meta: {
				headerName: "Conta",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					const { month, year } = useDateWithMonthAndYear();
					const { from, to } = useDateWithFromAndTo();
					const { dateConfig } = useDateConfig();
					const { dateType } = useDateType();

					const {
						data: accounts,
						isLoading: isLoadingAccounts,
						isSuccess: isSuccessAccounts,
					} = useQuery({
						queryKey: accountsKeys.filter({
							month,
							year,
							from,
							to,
							dateConfig,
							dateType,
						}),
						queryFn: () =>
							getAccounts({
								month,
								year,
								from,
								to,
								dateConfig,
								dateType,
							}),
					});

					const {
						data: banks,
						isLoading: isLoadingBanks,
						isSuccess: isSuccessBanks,
					} = useQuery({
						queryKey: banksKeys.all,
						queryFn: getBanks,
					});

					useEffect(() => {
						const hasError = !isSuccessAccounts && !isLoadingAccounts;

						if (hasError) {
							const timeoutId = setTimeout(() => {
								toast.error("Erro ao carregar contas");
							}, 0);

							return () => clearTimeout(timeoutId);
						}
					}, [isLoadingAccounts, isSuccessAccounts]);

					useEffect(() => {
						const hasError = !isSuccessBanks && !isLoadingBanks;

						if (hasError) {
							const timeoutId = setTimeout(() => {
								toast.error("Erro ao carregar bancos");
							}, 0);

							return () => clearTimeout(timeoutId);
						}
					}, [isLoadingBanks, isSuccessBanks]);

					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar conta..."
								disabled={
									isLoadingAccounts ||
									isLoadingBanks ||
									!isSuccessAccounts ||
									!isSuccessBanks
								}
							/>
							<CommandEmpty>Nenhuma conta encontrada</CommandEmpty>
							<CommandList>
								<CommandGroup heading="Contas">
									{isLoadingAccounts ||
									isLoadingBanks ||
									!isSuccessAccounts ||
									!isSuccessBanks ? (
										<LoadingCommands />
									) : (
										accounts?.map(account => {
											const bank = banks?.find(
												bank => bank.id === account.bankId
											);
											const icon = bank ? getFavicon(bank.image) : "";

											return (
												<CommandItem key={account.id}>
													<CheckboxWithFilterArrIncludesSome
														value={account.id}
														column={column}
													/>
													<label
														htmlFor={account.id}
														className="flex w-full items-center gap-2"
													>
														<Avatar className="h-6 w-6">
															<AvatarImage src={icon} alt={account.name} />
															<AvatarFallback>
																{account.name.slice(0, 2)}
															</AvatarFallback>
														</Avatar>
														<span>{account.name}</span>
													</label>
												</CommandItem>
											);
										})
									)}
								</CommandGroup>
							</CommandList>
						</Command>
					);
				},
			},
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
					queryKey: accountsKeys.byId(row.original.accountId),
					queryFn: () => getAccountById(row.original.accountId),
				});

				const {
					data: banks,
					isLoading: isLoadingBanks,
					isSuccess: isSuccessBanks,
				} = useQuery({
					queryKey: banksKeys.all,
					queryFn: getBanks,
				});

				const bank = banks?.find(bank => bank.id === accountById?.bankId);
				const icon = bank ? getFavicon(bank.image) : "";

				useEffect(() => {
					const hasError = !isSuccessAccountById && !isLoadingAccountById;

					if (hasError) {
						const timeoutId = setTimeout(() => {
							toast.error("Erro ao carregar conta");
						}, 0);

						return () => clearTimeout(timeoutId);
					}
				}, [isLoadingAccountById, isSuccessAccountById]);

				useEffect(() => {
					const hasError = !isSuccessBanks && !isLoadingBanks;

					if (hasError) {
						const timeoutId = setTimeout(() => {
							toast.error("Erro ao carregar bancos");
						}, 0);

						return () => clearTimeout(timeoutId);
					}
				}, [isLoadingBanks, isSuccessBanks]);

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
			meta: {
				headerName: "Descrição",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar descrição..."
								onValueChange={value => column.setFilterValue(value)}
							/>
							<CommandList />
						</Command>
					);
				},
			},
			header: "Descrição",
			cell: ({ row }) => {
				return (
					<div>
						<span>{row.original.name}</span>
						<span className="hidden">{row.getValue("name")}</span>
					</div>
				);
			},
		},
		{
			// name
			accessorKey: "frequency",
			meta: {
				headerName: "Parcela",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar número da	 parcela..."
								onValueChange={value => column.setFilterValue(value)}
							/>
							<CommandList />
						</Command>
					);
				},
			},
			cell: ({ row }) => {
				return (
					<div>
						<span>
							{row.original.frequency === FREQUENCY.DO_NOT_REPEAT && "Única"}
							{row.original.frequency === FREQUENCY.RECURRING && "Fixa Mensal"}
							{row.original.frequency === FREQUENCY.REPEAT &&
								`(${row.original.repeatSettings.currentCount}/${row.original.repeatSettings.count})`}
						</span>
						<span className="hidden">{row.getValue("frequency")}</span>
					</div>
				);
			},
		},
		{
			// description
			accessorKey: "description",
			meta: {
				headerName: "Observação",
			},
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
			filterFn: "arrIncludesSome",
			meta: {
				headerName: "Atribuído a",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					const workspaceId =
						typeof window !== "undefined"
							? localStorage.getItem("workspaceId")
							: "";

					const { assignments, isLoadingAssignments, isSuccessAssignments } =
						useAssignments(workspaceId);

					useEffect(() => {
						const hasError = !isSuccessAssignments && !isLoadingAssignments;

						if (hasError) {
							const timeoutId = setTimeout(() => {
								toast.error("Erro ao carregar usuários");
							}, 0);

							return () => clearTimeout(timeoutId);
						}
					}, [isLoadingAssignments, isSuccessAssignments]);

					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar usuário..."
								disabled={isLoadingAssignments || !isSuccessAssignments}
							/>
							<CommandEmpty>Nenhum usuário encontrado</CommandEmpty>
							<CommandList>
								<CommandGroup heading="Usuários">
									{isLoadingAssignments || !isSuccessAssignments ? (
										<LoadingCommands />
									) : (
										assignments.map(assignment => (
											<CommandItem key={assignment.id}>
												<CheckboxWithFilterArrIncludesSome
													value={assignment.id}
													column={column}
												/>
												<label
													htmlFor={assignment.id}
													className="flex w-full items-center gap-2"
												>
													<Avatar className="h-6 w-6">
														<AvatarImage
															src={assignment.image}
															alt={assignment.name}
														/>
														<AvatarFallback>
															{assignment.name.slice(0, 2)}
														</AvatarFallback>
													</Avatar>
													<span>{assignment.name}</span>
												</label>
											</CommandItem>
										))
									)}
								</CommandGroup>
							</CommandList>
						</Command>
					);
				},
			},
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
			meta: {
				headerName: "Fornecedor",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar descrição..."
								onValueChange={value => column.setFilterValue(value)}
							/>
							<CommandList />
						</Command>
					);
				},
			},
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
			meta: {
				headerName: "Valor",
			},
			header: "Valor",
			cell: ({ row }) => {
				const balance = row.original.balance.value;

				const balanceDiscountPercentage =
					row.original.balance.discountPercentage;
				const balanceDiscount = row.original.balance.discount;
				const balanceInterest = row.original.balance.interest;
				const balanceInterestPercentage =
					row.original.balance.interestPercentage;

				let discount = row.original.balance.discount ?? 0;
				let interest = row.original.balance.interest ?? 0;

				if (balanceDiscountPercentage) {
					discount = (balance * (balanceDiscountPercentage ?? 0)) / 100;
				}

				const balanceWithDiscount = balance - discount;

				if (balanceInterestPercentage) {
					interest =
						(balanceWithDiscount * (balanceInterestPercentage ?? 0)) / 100;
				}

				const liquidValue = balanceWithDiscount + interest;

				return (
					<div>
						<div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button type="button">
										<span
											className={cn(
												row.original.type === TRANSACTION_TYPE.RECIPE
													? "text-green-500"
													: "text-red-500"
											)}
										>
											{formatBalance(balance)}
										</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem>
										<span>Bruto:</span>
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

					// const balanceDiscountPercentage =
					// 	row.original.balance.discountPercentage;
					// const balanceInterestPercentage =
					// 	row.original.balance.interestPercentage;

					// let discount = row.original.balance.discount ?? 0;
					// let interest = row.original.balance.interest ?? 0;

					// if (balanceDiscountPercentage) {
					// 	discount = (balance * (balanceDiscountPercentage ?? 0)) / 100;
					// }

					// const balanceWithDiscount = balance - discount;

					// if (balanceInterestPercentage) {
					// 	interest = (balanceWithDiscount * (balanceInterestPercentage ?? 0)) / 100;
					// }

					// const liquidValue = balanceWithDiscount + interest;

					// if (row.original.type === TRANSACTION_TYPE.RECIPE) {
					// 	return acc + liquidValue;
					// }

					// return acc - liquidValue;

					if (row.original.type === TRANSACTION_TYPE.RECIPE) {
						return acc + balance;
					}

					return acc - balance;
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
			// balance.discount
			id: "balance.discount",
			accessorKey: "balance.discount",
			meta: {
				headerName: "Desconto",
			},
			header: "Desconto",
			cell: ({ row }) => {
				const discount =
					row.original.balance.discount !== 0
						? row.original.balance.discount
						: row.original.balance.discountPercentage;

				if (discount === 0)
					return (
						<div>
							<span>
								<NotInformed />
							</span>
							<span className="hidden">{row.getValue("balance.discount")}</span>
						</div>
					);

				const discountType = row.original.balance.discount
					? "value"
					: "percentage";

				return (
					<div>
						<span>
							{discountType === "percentage"
								? `${discount}%`
								: formatBalance(discount)}
						</span>
						<span className="hidden">{row.getValue("balance.discount")}</span>
					</div>
				);
			},
		},
		{
			// balance.discountPercentage
			id: "balance.discountPercentage",
			accessorKey: "balance.discountPercentage",
			meta: {
				headerName: "Desconto (%)",
			},
			header: "Desconto (%)",
			enableHiding: false,
			enableSorting: false,
			enableGrouping: false,
			minSize: 0,
			size: 0,
			cell: ({ row }) => {
				return (
					<span className="hidden">
						{row.getValue("balance.discountPercentage")}
					</span>
				);
			},
		},
		{
			// balance.interest
			id: "balance.interest",
			accessorKey: "balance.interest",
			meta: {
				headerName: "Juros",
			},
			header: "Juros",
			cell: ({ row }) => {
				const interest =
					row.original.balance.interest !== 0
						? row.original.balance.interest
						: row.original.balance.interestPercentage;

				if (interest === 0)
					return (
						<div>
							<span>
								<NotInformed />
							</span>
							<span className="hidden">{row.getValue("balance.interest")}</span>
						</div>
					);

				const interestType = row.original.balance.interest
					? "value"
					: "percentage";

				return (
					<div>
						<span>
							{interestType === "percentage"
								? `${interest}%`
								: formatBalance(interest)}
						</span>
						<span className="hidden">{row.getValue("balance.interest")}</span>
					</div>
				);
			},
		},
		{
			// balance.interestPercentage
			id: "balance.interestPercentage",
			accessorKey: "balance.interestPercentage",
			meta: {
				headerName: "Juros (%)",
			},
			header: "Juros (%)",
			enableHiding: false,
			enableSorting: false,
			enableGrouping: false,
			minSize: 0,
			size: 0,
			cell: ({ row }) => {
				return (
					<span className="hidden">
						{row.getValue("balance.interestPercentage")}
					</span>
				);
			},
		},
		{
			// balance.netBalance
			id: "balance.netBalance",
			accessorKey: "balance.netBalance",
			meta: {
				headerName: "Valor líquido",
			},
			cell: ({ row }) => {
				return (
					<div>
						<span
							className={cn(
								row.original.type === TRANSACTION_TYPE.RECIPE
									? "text-green-500"
									: "text-red-500"
							)}
						>
							{formatBalance(row.getValue("balance.netBalance"))}
						</span>
					</div>
				);
			},
			footer: ({ table }) => {
				const total = table.getSelectedRowModel().rows.reduce((acc, row) => {
					const liquidValue = row.original.balance.netBalance;

					if (row.original.type === TRANSACTION_TYPE.RECIPE) {
						return acc + liquidValue;
					}

					return acc - liquidValue;
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
			// categoryId
			accessorKey: "categoryId",
			filterFn: "arrIncludesSome",
			meta: {
				headerName: "Categoria",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					const { month, year } = useDateWithMonthAndYear();
					const { from, to } = useDateWithFromAndTo();
					const { dateConfig } = useDateConfig();
					const { dateType } = useDateType();

					const categories = useQueries({
						queries: Object.values(CATEGORY_TYPE)
							.filter(transaction => transaction !== CATEGORY_TYPE.TAG)
							.map(transaction => ({
								queryKey: categoriesKeys(transaction).filter({
									month,
									year,
									from,
									to,
									dateConfig,
									dateType,
								}),
								queryFn: () =>
									getCategories({
										transaction,
										month,
										year,
										from,
										to,
										dateConfig,
										dateType,
									}),
							})),
					});

					const isLoading = categories.some(query => query.isLoading);
					const isSuccess = categories.every(query => query.isSuccess);

					useEffect(() => {
						const hasError = !isSuccess && !isLoading;

						if (hasError) {
							const timeoutId = setTimeout(() => {
								toast.error("Erro ao carregar categorias");
							}, 0);

							return () => clearTimeout(timeoutId);
						}
					}, [isLoading, isSuccess]);

					const [recipeCategories, expenseCategories] = categories.map(
						query => query.data
					);

					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar categoria..."
								disabled={isLoading || !isSuccess}
							/>
							<CommandEmpty>Nenhuma categoria encontrada</CommandEmpty>
							<CommandList>
								<CommandGroup heading="Receitas">
									{isLoading || !isSuccess ? (
										<LoadingCommands />
									) : (
										recipeCategories.map(category => (
											<CommandItem key={category.id}>
												<CheckboxWithFilterArrIncludesSome
													value={category.id}
													column={column}
												/>
												<label
													htmlFor={category.id}
													className="flex w-full items-center gap-2"
												>
													<IconComponent name={category.icon} />
													<span>{category.name}</span>
												</label>
											</CommandItem>
										))
									)}
								</CommandGroup>
								<CommandGroup heading="Despesas">
									{isLoading || !isSuccess ? (
										<LoadingCommands />
									) : (
										expenseCategories.map(category => (
											<CommandItem key={category.id}>
												<CheckboxWithFilterArrIncludesSome
													value={category.id}
													column={column}
												/>
												<label
													htmlFor={category.id}
													className="flex w-full items-center gap-2"
												>
													<IconComponent name={category.icon} />
													<span>{category.name}</span>
												</label>
											</CommandItem>
										))
									)}
								</CommandGroup>
							</CommandList>
						</Command>
					);
				},
			},
			header: "Categoria",
			cell: ({ row }) => {
				const categoryId = row.original.categoryId;

				if (!categoryId)
					return (
						<div>
							<NotInformed />
						</div>
					);

				const {
					data: categoryById,
					isLoading: isLoadingCategoryById,
					isSuccess: isSuccessCategoryById,
				} = useQuery({
					queryKey: categoriesKeys(row.original.type).byId(categoryId),
					queryFn: () => getCategoryById(categoryId),
				});

				useEffect(() => {
					const hasError = !isSuccessCategoryById && !isLoadingCategoryById;

					if (hasError) {
						const timeoutId = setTimeout(() => {
							toast.error("Erro ao carregar categoria");
						}, 0);

						return () => clearTimeout(timeoutId);
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
			filterFn: "arrIncludesSome",
			meta: {
				headerName: "Subcategoria",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					const { month, year } = useDateWithMonthAndYear();
					const { from, to } = useDateWithFromAndTo();
					const { dateConfig } = useDateConfig();
					const { dateType } = useDateType();

					const categories = useQueries({
						queries: Object.values(CATEGORY_TYPE)
							.filter(transaction => transaction !== CATEGORY_TYPE.TAG)
							.map(transaction => ({
								queryKey: categoriesKeys(transaction).filter({
									month,
									year,
									from,
									to,
									dateConfig,
									dateType,
								}),
								queryFn: () =>
									getCategories({
										transaction,
										month,
										year,
										from,
										to,
										dateConfig,
										dateType,
									}),
							})),
					});

					const isLoading = categories.some(query => query.isLoading);
					const isSuccess = categories.every(query => query.isSuccess);

					useEffect(() => {
						const hasError = !isSuccess && !isLoading;

						if (hasError) {
							const timeoutId = setTimeout(() => {
								toast.error("Erro ao carregar categorias");
							}, 0);

							return () => clearTimeout(timeoutId);
						}
					}, [isLoading, isSuccess]);

					const [recipeCategories, expenseCategories] = categories.map(query =>
						query.data?.flatMap(category => category.subCategories)
					);

					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar subcategoria..."
								disabled={isLoading || !isSuccess}
							/>
							<CommandEmpty>Nenhuma subcategoria encontrada</CommandEmpty>
							<CommandList>
								<CommandGroup heading="Receitas">
									{isLoading || !isSuccess ? (
										<LoadingCommands />
									) : (
										recipeCategories.map(category => (
											<CommandItem key={category.id}>
												<CheckboxWithFilterArrIncludesSome
													value={category.id}
													column={column}
												/>
												<label
													htmlFor={category.id}
													className="flex w-full items-center gap-2"
												>
													<IconComponent name={category.icon} />
													<span>{category.name}</span>
												</label>
											</CommandItem>
										))
									)}
								</CommandGroup>
								<CommandGroup heading="Despesas">
									{isLoading || !isSuccess ? (
										<LoadingCommands />
									) : (
										expenseCategories.map(category => (
											<CommandItem key={category.id}>
												<CheckboxWithFilterArrIncludesSome
													value={category.id}
													column={column}
												/>
												<label
													htmlFor={category.id}
													className="flex w-full items-center gap-2"
												>
													<IconComponent name={category.icon} />
													<span>{category.name}</span>
												</label>
											</CommandItem>
										))
									)}
								</CommandGroup>
							</CommandList>
						</Command>
					);
				},
			},
			header: "Subcategoria",
			cell: ({ row }) => {
				const categoryId = row.original.categoryId;
				const subCategoryId = row.original.subCategoryId;

				if (!categoryId || !subCategoryId)
					return (
						<div>
							<NotInformed />
						</div>
					);

				const {
					data: categoryById,
					isLoading: isLoadingCategoryById,
					isSuccess: isSuccessCategoryById,
				} = useQuery({
					queryKey: categoriesKeys(row.original.type).byId(categoryId),
					queryFn: () => getCategoryById(categoryId),
				});

				const subCategory = categoryById?.subCategories?.find(
					subCategory => subCategory.id === subCategoryId
				);

				useEffect(() => {
					const hasError = !isSuccessCategoryById && !isLoadingCategoryById;

					if (hasError) {
						const timeoutId = setTimeout(() => {
							toast.error("Erro ao carregar subcategoria");
						}, 0);

						return () => clearTimeout(timeoutId);
					}
				}, [isLoadingCategoryById, isSuccessCategoryById]);

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
			filterFn: (row, _, filterValue: Array<string>) => {
				const tags = row.original.tags;
				const tagIds = tags
					.filter(tag => tag.subTagId === "000000000000000000000000")
					.map(tag => tag.tagId);

				return (
					filterValue.length === 0 ||
					filterValue.some(value => tagIds.includes(value))
				);
			},

			meta: {
				headerName: "Etiquetas",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					const { month, year } = useDateWithMonthAndYear();
					const { from, to } = useDateWithFromAndTo();
					const { dateConfig } = useDateConfig();
					const { dateType } = useDateType();

					const {
						data: tags,
						isLoading: isLoadingTags,
						isSuccess: isSuccessTags,
					} = useQuery({
						queryKey: categoriesKeys(CATEGORY_TYPE.TAG).filter({
							month,
							year,
							from,
							to,
							dateConfig,
							dateType,
						}),
						queryFn: () =>
							getCategories({ transaction: CATEGORY_TYPE.TAG, month, year }),
					});

					useEffect(() => {
						const hasError = !isSuccessTags && !isLoadingTags;

						if (hasError) {
							const timeoutId = setTimeout(() => {
								toast.error("Erro ao carregar etiquetas");
							}, 0);

							return () => clearTimeout(timeoutId);
						}
					}, [isLoadingTags, isSuccessTags]);

					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar etiqueta..."
								disabled={isLoadingTags || !isSuccessTags}
							/>
							<CommandEmpty>Nenhuma etiqueta encontrada</CommandEmpty>
							<CommandList>
								<CommandGroup heading="Etiquetas">
									{isLoadingTags || !isSuccessTags ? (
										<LoadingCommands />
									) : (
										tags?.map(tag => (
											<CommandItem key={tag.id}>
												<CheckboxWithFilterArrIncludesSome
													value={tag.id}
													column={column}
												/>
												<label
													htmlFor={tag.id}
													className="flex w-full items-center gap-2"
												>
													<IconComponent name={tag.icon} />
													<span>{tag.name}</span>
												</label>
											</CommandItem>
										))
									)}
								</CommandGroup>
							</CommandList>
						</Command>
					);
				},
			},
			header: "Etiquetas",
			cell: ({ row }) => {
				const tagsWithoutSubTags = row.original.tags.filter(
					tag => tag.subTagId === "000000000000000000000000"
				);

				const hasTags = tagsWithoutSubTags.length > 0;

				if (!hasTags) {
					return (
						<div className="flex items-center gap-2">
							<NotInformed />
							<span className="hidden">
								{(row.getValue("tags") as Array<Tag>).map(tag => tag.tagId)}
							</span>
						</div>
					);
				}

				const tagIds = tagsWithoutSubTags.map(tag => tag.tagId);

				const tagsQueries = useQueries({
					queries: tagIds.map(tagId => ({
						queryKey: categoriesKeys(row.original.type).byId(tagId),
						queryFn: () => getCategoryById(tagId),
					})),
				});

				const isLoading = tagsQueries.some(query => query.isLoading);
				const isSuccess = tagsQueries.every(query => query.isSuccess);

				useEffect(() => {
					const hasError = !isSuccess && !isLoading;

					if (hasError) {
						const timeoutId = setTimeout(() => {
							toast.error("Erro ao carregar etiquetas");
						}, 0);

						return () => clearTimeout(timeoutId);
					}
				}, [isLoading, isSuccess]);

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
								<span className="hidden">
									{(row.getValue("tags") as Array<Tag>).map(tag => tag.tagId)}
								</span>
							</>
						)}
					</div>
				);
			},
		},
		{
			// subTags
			accessorKey: "subTags",
			filterFn: (row, _, filterValue: Array<Tag>) => {
				const tags = row.original.tags;

				if (filterValue.length === 0) return true;

				return filterValue.some(filter =>
					tags.some(
						tag =>
							tag.tagId === filter.tagId && tag.subTagId === filter.subTagId
					)
				);
			},
			meta: {
				headerName: "Sub etiquetas",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					const { month, year } = useDateWithMonthAndYear();
					const { from, to } = useDateWithFromAndTo();
					const { dateConfig } = useDateConfig();
					const { dateType } = useDateType();

					const {
						data: tags,
						isLoading: isLoadingTags,
						isSuccess: isSuccessTags,
					} = useQuery({
						queryKey: categoriesKeys(CATEGORY_TYPE.TAG).filter({
							month,
							year,
							from,
							to,
							dateConfig,
							dateType,
						}),
						queryFn: () =>
							getCategories({
								transaction: CATEGORY_TYPE.TAG,
								month,
								year,
								from,
								to,
								dateConfig,
								dateType,
							}),
					});

					useEffect(() => {
						const hasError = !isSuccessTags && !isLoadingTags;

						if (hasError) {
							const timeoutId = setTimeout(() => {
								toast.error("Erro ao carregar sub etiquetas");
							}, 0);

							return () => clearTimeout(timeoutId);
						}
					}, [isLoadingTags, isSuccessTags]);

					const subTags = tags.flatMap(tag => ({
						tagId: tag.id,
						tagName: tag.name,
						tagIcon: tag.icon,
						subCategories: tag.subCategories,
					}));

					return (
						<Command>
							<CommandInput
								placeholder="Pesquisar sub etiqueta..."
								disabled={isLoadingTags || !isSuccessTags}
							/>
							<CommandEmpty>Nenhuma sub etiqueta encontrada</CommandEmpty>
							<CommandList>
								{(isLoadingTags || !isSuccessTags) && (
									<CommandGroup heading="Etiquetas">
										<LoadingCommands />
									</CommandGroup>
								)}
								{!isLoadingTags &&
									isSuccessTags &&
									subTags
										?.filter(subTag => subTag.subCategories?.length > 0)
										.map(subTag => (
											<CommandGroup
												key={subTag.tagId}
												heading={
													<div className="flex items-center gap-2">
														<IconComponent
															className="h-4 w-4"
															name={subTag.tagIcon}
														/>
														<span>{subTag.tagName}</span>
													</div>
												}
											>
												{subTag.subCategories?.map(subCategory => (
													<CommandItem key={subCategory.id} className="pl-4">
														<CheckboxWithFilterArrIncludesSomeOnSubTags
															value={subCategory.id}
															tagId={subTag.tagId}
															column={column}
														/>
														<label
															htmlFor={`${subTag.tagId}-${subCategory.id}`}
															className="flex w-full items-center gap-2"
														>
															<IconComponent name={subCategory.icon} />
															<span>{subCategory.name}</span>
														</label>
													</CommandItem>
												))}
											</CommandGroup>
										))}
							</CommandList>
						</Command>
					);
				},
			},
			cell: ({ row }) => {
				const tagsWithSubTags = row.original.tags.filter(
					tag => tag.subTagId !== "000000000000000000000000"
				);

				const hasSubTags = tagsWithSubTags.length > 0;

				if (!hasSubTags) {
					return (
						<div className="flex items-center gap-2">
							<NotInformed />
							<span className="hidden">
								{(row.getValue("tags") as Array<Tag>).map(tag => tag.subTagId)}
							</span>
						</div>
					);
				}

				const categoriesQueries = useQueries({
					queries: tagsWithSubTags.map(tag => ({
						queryKey: categoriesKeys(row.original.type).byId(tag.tagId),
						queryFn: () => getCategoryById(tag.tagId),
					})),
				});

				const isLoading = categoriesQueries.some(query => query.isLoading);
				const isSuccess = categoriesQueries.every(query => query.isSuccess);

				const subTags: Array<SubTag> = [];

				categoriesQueries.forEach((query, index) => {
					if (!query.isSuccess && !query.isLoading) return;

					const tag = tagsWithSubTags[index];
					const categoryData = query.data;

					const subCategory = categoryData?.subCategories?.find(
						subCategory => subCategory.id === tag.subTagId
					);

					if (subCategory) {
						subTags.push({
							id: subCategory.id,
							name: subCategory.name,
							icon: subCategory.icon,
						});
					}
				});

				useEffect(() => {
					const hasError = !isSuccess && !isLoading;

					if (hasError) {
						const timeoutId = setTimeout(() => {
							toast.error("Erro ao carregar sub etiquetas");
						}, 0);

						return () => clearTimeout(timeoutId);
					}
				}, [isLoading, isSuccess]);

				return (
					<div className="flex items-center gap-2">
						{isLoading || subTags.length === 0 ? (
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
								<span className="hidden">
									{(row.getValue("tags") as Array<Tag>).map(
										tag => tag.subTagId
									)}
								</span>
							</>
						)}
					</div>
				);
			},
		},
		{
			// isConfirmed
			accessorKey: "isConfirmed",
			filterFn: "arrIncludesSomeBoolean",
			meta: {
				headerName: "Status",
				filter: ({
					column,
				}: {
					column: Column<TransactionWithTagsAndSubTags>;
					table: Table<TransactionWithTagsAndSubTags>;
				}) => {
					return (
						<Command>
							<CommandInput placeholder="Pesquisar status..." />
							<CommandEmpty>Nenhum status encontrado</CommandEmpty>
							<CommandList>
								<CommandGroup heading="Status">
									<CommandItem>
										<Checkbox
											id="confirmed"
											checked={
												Array.isArray(column.getFilterValue()) &&
												(column.getFilterValue() as Array<string>).includes(
													"true"
												)
											}
											onCheckedChange={checked => {
												column.setFilterValue((old: Array<string>) => {
													const currentValues = Array.isArray(old) ? old : [];

													return checked
														? [...currentValues, "true"]
														: currentValues.filter(value => value !== "true");
												});
											}}
										/>
										<label
											htmlFor="confirmed"
											className="flex w-full items-center gap-2"
										>
											<span>Confirmada</span>
										</label>
									</CommandItem>
									<CommandItem>
										<Checkbox
											id="not-confirmed"
											checked={
												Array.isArray(column.getFilterValue()) &&
												(column.getFilterValue() as Array<string>).includes(
													"false"
												)
											}
											onCheckedChange={checked => {
												column.setFilterValue((old: Array<string>) => {
													const currentValues = Array.isArray(old) ? old : [];

													return checked
														? [...currentValues, "false"]
														: currentValues.filter(value => value !== "false");
												});
											}}
										/>
										<label
											htmlFor="not-confirmed"
											className="flex w-full items-center gap-2"
										>
											<span>Não confirmada</span>
										</label>
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					);
				},
			},
			size: 160,
			cell: ({ row }) => {
				return (
					<div>
						<span>
							{row.original.type === TRANSACTION_TYPE.RECIPE
								? row.original.isConfirmed
									? "Recebida"
									: "Não recebida"
								: row.original.isConfirmed
									? "Paga"
									: "Não paga"}
						</span>
						<span className="hidden">{row.getValue("isConfirmed")}</span>
					</div>
				);
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
									className: "max-w-[100dvh] overflow-y-auto max-w-screen-md",
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
							<Actions
								handleDelete={deleteTransactionMutation}
								id={idsString}
							/>
						)}
					</div>
				);
			},
		},
	];

	if (customFields?.length > 0) {
		const insertPosition = columns.length - 2;

		const customColumns = customFields?.map(
			customField =>
				({
					id: `customField-${customField.id}`,
					accessorFn: row => {
						const currentCustomField = row.customFields?.find(
							currentCustomField => currentCustomField.id === customField.id
						);

						return currentCustomField?.value ?? null;
					},
					filterFn:
						customField.type === CUSTOM_FIELD_TYPE.SELECT
							? "arrIncludesSome"
							: customField.type === CUSTOM_FIELD_TYPE.NUMBER
								? null
								: (row, columnId, filterValue) => {
										// Se não houver valor para filtrar, retorna true
										if (!filterValue) return true;

										// Obter o valor da linha - já deve estar em formato acessível graças ao accessorFn
										const rowValue = row.getValue(columnId);

										// Se não houver valor na linha, não corresponde ao filtro
										if (!rowValue) return false;

										// Extrai o texto a ser comparado do objeto
										const textToCompare =
											typeof rowValue === "object"
												? (rowValue as { value: string }).value || ""
												: String(rowValue);

										// Comparação case-insensitive simples
										return textToCompare
											.toLowerCase()
											.includes(String(filterValue).toLowerCase());
									},
					meta: {
						headerName: customField.name,
						filter:
							customField.type === CUSTOM_FIELD_TYPE.NUMBER
								? null
								: ({
										column,
									}: {
										column: Column<TransactionWithTagsAndSubTags>;
										table: Table<TransactionWithTagsAndSubTags>;
									}) => {
										const filterComponent = getCustomFieldFilter({
											customField,
											column,
										});

										return filterComponent;
									},
					},
					header: `CF-${customField.name}`,
					cell: ({ row }) => {
						const hasAccessor =
							`customField.${customField.id}.value` in row.original;

						const currentCustomField = row.original.customFields?.find(
							currentCustomField => currentCustomField.id === customField.id
						);

						const value: string = hasAccessor
							? row.getValue(`customField.${customField.id}.value`)
							: currentCustomField?.value;

						if (!value) {
							return (
								<div className="flex items-center gap-2">
									<NotInformed />
								</div>
							);
						}

						return (
							<div className="text-break">
								{currentCustomField?.type === CUSTOM_FIELD_TYPE.NUMBER ? (
									<NumericFormat
										value={Number(currentCustomField?.value)}
										thousandSeparator="."
										decimalSeparator=","
										fixedDecimalScale={true}
										allowNegative
										readOnly
										className="bg-transparent outline-none"
									/>
								) : (
									<span>{value}</span>
								)}
							</div>
						);
					},
				}) as ColumnDef<TransactionWithTagsAndSubTags>
		);

		columns.splice(insertPosition, 0, ...customColumns);
	}

	return columns;
};
