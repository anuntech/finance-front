import { Counter } from "@/components/counter";
import { DatePicker } from "@/components/date-picker";
import { IconComponent } from "@/components/get-lucide-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector from "@/components/ui/multiple-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAssignments } from "@/hooks/assignments";
import { getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { getCategories } from "@/http/categories/get";
import { type Transaction, getTransactions } from "@/http/transactions/get";
import { createTransaction } from "@/http/transactions/post";
import { updateTransaction } from "@/http/transactions/put";
import { cn } from "@/lib/utils";
import {
	type ITransactionsForm,
	transactionsSchema,
} from "@/schemas/transactions";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { FREQUENCY, FREQUENCY_VALUES } from "@/types/enums/frequency";
import { INTERVAL, INTERVAL_VALUES } from "@/types/enums/interval";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { IFormData } from "@/types/form-data";
import { getFavicon } from "@/utils/get-favicon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";

export const getCategoryType = (transaction: TRANSACTION_TYPE) => {
	if (transaction === TRANSACTION_TYPE.RECIPE) return CATEGORY_TYPE.RECIPE;

	if (transaction === TRANSACTION_TYPE.EXPENSE) return CATEGORY_TYPE.EXPENSE;

	return null;
};

export const TransactionsForm: IFormData = ({
	type,
	setComponentIsOpen,
	id,
	transactionType,
}) => {
	// states
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null
	);
	const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

	const [isMoreBalanceOpen, setIsMoreBalanceOpen] = useState(false);
	const [isRepeatSettingsOpen, setIsRepeatSettingsOpen] = useState(false);
	const [isMoreDatesOpen, setIsMoreDatesOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const [tagsSelected, setTagsSelected] = useState<
		Array<{ tagId: string; subTagId: string }>
	>([]);

	// queries
	const queryClient = useQueryClient();

	const { data: transactions } = useQuery({
		queryKey: ["get-transactions"],
		queryFn: getTransactions,
	});

	const transaction = transactions?.find(transaction => transaction.id === id);

	const {
		data: accounts,
		isLoading: isLoadingAccounts,
		isSuccess: isSuccessAccounts,
	} = useQuery({
		queryKey: ["get-accounts"],
		queryFn: getAccounts,
	});

	if (!isSuccessAccounts && !isLoadingAccounts) {
		toast.error("Erro ao carregar contas");
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

	const {
		data: categories,
		isLoading: isLoadingCategories,
		isSuccess: isSuccessCategories,
	} = useQuery({
		queryKey: ["get-categories"],
		queryFn: () =>
			getCategories(
				getCategoryType(transaction ? transaction.type : transactionType)
			),
	});

	if (!isSuccessCategories && !isLoadingCategories) {
		toast.error("Erro ao carregar categorias");
	}

	const subCategories = categories?.find(
		category => category.id === selectedCategoryId
	)?.subCategories;

	if (!isSuccessCategories && !isLoadingCategories && !subCategories) {
		toast.error("Erro ao carregar subcategorias");
	}

	const {
		data: tags,
		isLoading: isLoadingTags,
		isSuccess: isSuccessTags,
	} = useQuery({
		queryKey: ["get-tags"],
		queryFn: () => getCategories(CATEGORY_TYPE.TAG),
	});

	if (!isSuccessTags && !isLoadingTags && !tags) {
		toast.error("Erro ao carregar etiquetas");
	}

	const subTags = tags?.find(tag => tag.id === selectedTagId)?.subCategories;

	if (!isSuccessTags && !isLoadingTags && !subTags) {
		toast.error("Erro ao carregar sub etiquetas");
	}

	const workspaceId =
		typeof window !== "undefined" ? localStorage.getItem("workspaceId") : "";

	const { assignments, isLoadingAssignments, isSuccessAssignments } =
		useAssignments(workspaceId);

	// form
	const form = useForm<ITransactionsForm>({
		defaultValues: {
			type: type === "edit" ? transaction?.type : transactionType,
			name: type === "edit" ? transaction?.name : "",
			description: type === "edit" ? transaction?.description : "",
			assignedTo: type === "edit" ? transaction?.assignedTo : "",
			supplier: type === "edit" ? transaction?.supplier : "",
			balance:
				type === "edit"
					? {
							value: transaction?.balance.value,
							parts: transaction?.balance.parts,
							labor: transaction?.balance.labor,
							grossValue:
								transaction?.balance.value +
								transaction?.balance.parts +
								transaction?.balance.labor,
							discount: transaction?.balance.discount,
							discountPercentage: transaction?.balance.discountPercentage,
							interest: transaction?.balance.interest,
							interestPercentage: transaction?.balance.interestPercentage,
							liquidValue:
								transaction?.balance.value +
								transaction?.balance.parts +
								transaction?.balance.labor -
								transaction?.balance.discount +
								transaction?.balance.interest,
						}
					: {
							value: null,
							parts: null,
							labor: null,
							grossValue: null,
							discount: null,
							discountPercentage: null,
							interest: null,
							interestPercentage: null,
							liquidValue: null,
						},
			invoice: type === "edit" ? transaction?.invoice : "",
			frequency:
				type === "edit" ? transaction?.frequency : FREQUENCY.DO_NOT_REPEAT,
			repeatSettings:
				type === "edit"
					? transaction?.frequency === FREQUENCY.REPEAT
						? transaction?.repeatSettings
						: null
					: null,
			dueDate: type === "edit" ? new Date(transaction?.dueDate) : new Date(),
			isConfirmed: type === "edit" ? transaction?.isConfirmed : false,
			categoryId: type === "edit" ? transaction?.categoryId : "",
			subCategoryId: type === "edit" ? transaction?.subCategoryId : "",
			tagId: type === "edit" ? [] : [],
			subTagId: type === "edit" ? [] : [],
			accountId: type === "edit" ? transaction?.accountId : "",
			registrationDate:
				type === "edit" ? new Date(transaction?.registrationDate) : new Date(),
			confirmationDate:
				type === "edit"
					? transaction?.confirmationDate
						? new Date(transaction?.confirmationDate)
						: null
					: null,
		},
		resolver: zodResolver(transactionsSchema),
	});

	if (type === "edit" && transaction && !selectedCategoryId && !selectedTagId) {
		setSelectedCategoryId(transaction.categoryId);
		setSelectedTagId(transaction.tagsIds);
	}

	// mutations
	const addTransactionMutation = useMutation({
		mutationFn: (data: ITransactionsForm) =>
			createTransaction({
				type: data.type,
				name: data.name,
				description: data.description,
				assignedTo: data.assignedTo,
				supplier: data.supplier,
				balance: {
					value: data.balance.value,
					parts: data.balance.parts,
					labor: data.balance.labor,
					discount: data.balance.discount,
					discountPercentage: data.balance.discountPercentage,
					interest: data.balance.interest,
					interestPercentage: data.balance.interestPercentage,
				},
				invoice: data.invoice,
				frequency: data.frequency,
				repeatSettings:
					data.frequency === FREQUENCY.REPEAT
						? {
								initialInstallment: data.repeatSettings?.initialInstallment,
								count: data.repeatSettings?.count,
								interval: data.repeatSettings?.interval,
							}
						: null,
				dueDate: data.dueDate.toISOString(),
				isConfirmed: data.isConfirmed,
				categoryId: data.categoryId,
				subCategoryId: data.subCategoryId,
				tags: tagsSelected,
				accountId: data.accountId,
				registrationDate: data.registrationDate.toISOString(),
				confirmationDate: data.confirmationDate?.toISOString() || null,
			}),
		onSuccess: (data: Transaction) => {
			queryClient.setQueryData(
				["get-transactions"],
				(transactions: Array<Transaction>) => {
					const newTransaction: Transaction = {
						id: data.id,
						type: data.type,
						name: data.name,
						description: data.description,
						assignedTo: data.assignedTo,
						supplier: data.supplier,
						balance: {
							value: data.balance.value,
							parts: data.balance.parts,
							labor: data.balance.labor,
							discount: data.balance.discount,
							discountPercentage: data.balance.discountPercentage,
							interest: data.balance.interest,
							interestPercentage: data.balance.interestPercentage,
						},
						invoice: data.invoice,
						frequency: data.frequency,
						repeatSettings:
							data.frequency === FREQUENCY.REPEAT
								? {
										initialInstallment: data.repeatSettings?.initialInstallment,
										count: data.repeatSettings?.count,
										interval: data.repeatSettings?.interval,
									}
								: null,
						dueDate: data.dueDate,
						isConfirmed: data.isConfirmed,
						categoryId: data.categoryId,
						subCategoryId: data.subCategoryId,
						tags: tagsSelected,
						accountId: data.accountId,
						registrationDate: data.registrationDate,
						confirmationDate: data.confirmationDate ?? null,
					};

					const newTransactions =
						transactions?.length > 0
							? [newTransaction, ...transactions]
							: [newTransaction];

					return newTransactions;
				}
			);
			queryClient.invalidateQueries({ queryKey: ["get-transactions"] });

			toast.success("Transação criada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar transação: ${message}`);
		},
	});

	const updateTransactionMutation = useMutation({
		mutationFn: (data: ITransactionsForm) =>
			updateTransaction({
				id: id,
				type: data.type,
				name: data.name,
				description: data.description,
				assignedTo: data.assignedTo,
				supplier: data.supplier,
				balance: {
					value: data.balance.value,
					parts: data.balance.parts,
					labor: data.balance.labor,
					discount: data.balance.discount,
					discountPercentage: data.balance.discountPercentage,
					interest: data.balance.interest,
					interestPercentage: data.balance.interestPercentage,
				},
				invoice: data.invoice,
				frequency: data.frequency,
				repeatSettings:
					data.frequency === FREQUENCY.REPEAT
						? {
								initialInstallment: data.repeatSettings?.initialInstallment,
								count: data.repeatSettings?.count,
								interval: data.repeatSettings?.interval,
							}
						: null,
				dueDate: data.dueDate.toISOString(),
				isConfirmed: data.isConfirmed,
				categoryId: data.categoryId,
				subCategoryId: data.subCategoryId,
				tags: tagsSelected,
				accountId: data.accountId,
				registrationDate: data.registrationDate.toISOString(),
				confirmationDate: data.confirmationDate?.toISOString() || null,
			}),
		onSuccess: (data: Transaction) => {
			queryClient.setQueryData(
				["get-transactions"],
				(transactions: Array<Transaction>) => {
					const newTransaction = transactions?.map(transaction => {
						if (transaction.id !== id) return transaction;

						const transactionUpdated = {
							id: transaction.id,
							type: data.type,
							name: data.name,
							description: data.description,
							assignedTo: data.assignedTo,
							supplier: data.supplier,
							balance: {
								value: data.balance.value,
								parts: data.balance.parts,
								labor: data.balance.labor,
								discount: data.balance.discount,
								discountPercentage: data.balance.discountPercentage,
								interest: data.balance.interest,
								interestPercentage: data.balance.interestPercentage,
							},
							invoice: data.invoice,
							frequency: data.frequency,
							repeatSettings:
								data.frequency === FREQUENCY.REPEAT
									? {
											initialInstallment:
												data.repeatSettings?.initialInstallment,
											count: data.repeatSettings?.count,
											interval: data.repeatSettings?.interval,
										}
									: null,
							dueDate: data.dueDate,
							isConfirmed: data.isConfirmed,
							categoryId: data.categoryId,
							subCategoryId: data.subCategoryId,
							tags: tagsSelected,
							accountId: data.accountId,
							registrationDate: data.registrationDate,
							confirmationDate: data.confirmationDate ?? null,
						};

						return transactionUpdated;
					});

					return newTransaction;
				}
			);
			queryClient.invalidateQueries({ queryKey: ["get-transactions"] });

			toast.success("Transação atualizada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar transação: ${message}`);
		},
	});

	// handlers
	const onSubmit = (data: ITransactionsForm) => {
		if (Object.keys(form.formState.errors).length > 0) {
			toast.error("Formulário inválido!");

			return;
		}

		if (type === "add") {
			addTransactionMutation.mutate(data);
		}

		if (type === "edit") {
			updateTransactionMutation.mutate(data);
		}
	};

	// watch
	const balanceValue = form.watch("balance.value");
	const balanceParts = form.watch("balance.parts");
	const balanceLabor = form.watch("balance.labor");
	const balanceDiscount = form.watch("balance.discount");
	const balanceInterest = form.watch("balance.interest");
	const balanceDiscountPercentage = form.watch("balance.discountPercentage");
	const balanceInterestPercentage = form.watch("balance.interestPercentage");

	// effects
	useEffect(() => {
		if (!isMoreBalanceOpen) return;

		console.log(balanceParts);

		const grossValue =
			(balanceValue ?? 0) + (balanceParts ?? 0) + (balanceLabor ?? 0);
		const discountPercentageCalculated =
			(grossValue * (balanceDiscountPercentage ?? 0)) / 100;
		const interestPercentageCalculated =
			(grossValue * (balanceInterestPercentage ?? 0)) / 100;
		const liquidValue =
			grossValue -
			(balanceDiscount ?? 0) -
			discountPercentageCalculated +
			(balanceInterest ?? 0) +
			interestPercentageCalculated;

		form.setValue("balance.grossValue", grossValue);
		form.setValue("balance.liquidValue", liquidValue);
	}, [
		balanceValue,
		balanceParts,
		balanceLabor,
		balanceDiscount,
		balanceInterest,
		balanceDiscountPercentage,
		balanceInterestPercentage,
		form,
		isMoreBalanceOpen,
	]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				{/* form view */}
				<ScrollArea className="m-2 h-[70dvh] rounded-md border p-2">
					<div className="flex flex-col gap-4 p-2">
						{/* form name and description */}
						<div className="flex w-full gap-2">
							<FormField
								control={form.control}
								name="name"
								render={() => (
									<FormItem className="w-full">
										<FormLabel>Número do documento</FormLabel>
										<FormControl>
											<Input
												placeholder="Número do documento da transação"
												{...form.register("name")}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={() => (
									<FormItem className="w-full">
										<FormLabel>Observação</FormLabel>
										<FormControl>
											<Textarea
												className="h-10 max-h-64 min-h-10"
												placeholder="Observação da transação"
												{...form.register("description")}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{/* form assigned to and supplier */}
						<div className="flex w-full gap-2">
							<FormField
								control={form.control}
								name="assignedTo"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Atribuído a</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={value => {
													field.onChange(value);
												}}
												disabled={assignments.length === 0}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione a frequência" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														{assignments.map(assigned => (
															<SelectItem key={assigned.id} value={assigned.id}>
																<div className="flex items-center gap-2">
																	<Avatar className="h-6 w-6">
																		<AvatarImage
																			src={assigned.image}
																			alt={assigned.name}
																		/>
																		<AvatarFallback>
																			{assigned.name.slice(0, 2)}
																		</AvatarFallback>
																	</Avatar>
																	{assigned.name}
																</div>
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="supplier"
								render={() => (
									<FormItem className="w-full">
										<FormLabel>Fornecedor</FormLabel>
										<FormControl>
											<Input
												placeholder="Nome do fornecedor"
												{...form.register("supplier")}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{/* form balance */}
						<div className="flex flex-col gap-2">
							<FormField
								control={form.control}
								name="balance.value"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Valor</FormLabel>
										<FormControl>
											<div className="flex w-full items-end gap-2">
												<NumericFormat
													prefix="R$ "
													thousandSeparator="."
													decimalSeparator=","
													fixedDecimalScale={true}
													decimalScale={2}
													value={field.value}
													onValueChange={values => {
														const numericValue = values.floatValue ?? null;

														field.onChange(numericValue);
													}}
													allowNegative={false}
													placeholder="Valor da transação"
													customInput={Input}
													className="w-[90%]"
												/>
												<Button
													type="button"
													variant="outline"
													className="w-[10%]"
													onClick={() =>
														setIsMoreBalanceOpen(!isMoreBalanceOpen)
													}
													title={
														isMoreBalanceOpen ? "Mostrar menos" : "Mostrar mais"
													}
												>
													<ChevronsUpDown className="h-4 w-4" />
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* form balance details */}
							{isMoreBalanceOpen && (
								<>
									<div className="flex gap-2">
										<FormField
											control={form.control}
											name="balance.parts"
											render={({ field }) => (
												<FormItem className="w-1/2">
													<FormLabel>Peças</FormLabel>
													<FormControl>
														<NumericFormat
															prefix="R$ "
															thousandSeparator="."
															decimalSeparator=","
															fixedDecimalScale={true}
															decimalScale={2}
															value={field.value}
															onValueChange={values => {
																const numericValue = values.floatValue ?? null;

																field.onChange(numericValue);
															}}
															allowNegative={false}
															placeholder="Valor das peças"
															customInput={Input}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="balance.labor"
											render={({ field }) => (
												<FormItem className="w-1/2">
													<FormLabel>Mão de obra</FormLabel>
													<FormControl>
														<NumericFormat
															prefix="R$ "
															thousandSeparator="."
															decimalSeparator=","
															fixedDecimalScale={true}
															decimalScale={2}
															value={field.value}
															onValueChange={values => {
																const numericValue = values.floatValue ?? null;

																field.onChange(numericValue);
															}}
															allowNegative={false}
															placeholder="Valor da mão de obra"
															customInput={Input}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<FormField
										control={form.control}
										name="balance.grossValue"
										render={({ field }) => {
											return (
												<FormItem className="w-full">
													<FormLabel>Total bruto</FormLabel>
													<FormControl>
														<NumericFormat
															prefix="R$ "
															thousandSeparator="."
															decimalSeparator=","
															fixedDecimalScale={true}
															decimalScale={2}
															value={field.value}
															onValueChange={values => {
																const numericValue = values.floatValue ?? null;

																field.onChange(numericValue);
															}}
															allowNegative={false}
															placeholder="Valor total"
															customInput={Input}
															readOnly
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											);
										}}
									/>
									<div className="flex gap-2">
										<FormField
											control={form.control}
											name="balance.discount"
											render={({ field }) => (
												<FormItem className="w-1/2">
													<FormLabel>Desconto</FormLabel>
													<FormControl>
														<NumericFormat
															prefix="R$ "
															thousandSeparator="."
															decimalSeparator=","
															fixedDecimalScale={true}
															decimalScale={2}
															value={field.value}
															onValueChange={values => {
																const numericValue = values.floatValue ?? null;

																field.onChange(numericValue);
															}}
															allowNegative={false}
															placeholder="Valor do desconto"
															customInput={Input}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="balance.discountPercentage"
											render={({ field }) => (
												<FormItem className="w-1/2">
													<FormLabel>Desconto (%)</FormLabel>
													<FormControl>
														<NumericFormat
															suffix="%"
															thousandSeparator="."
															decimalSeparator=","
															fixedDecimalScale={true}
															decimalScale={2}
															value={field.value}
															onValueChange={values => {
																const numericValue = values.floatValue ?? null;

																field.onChange(numericValue);
															}}
															allowNegative={false}
															placeholder="Valor do desconto em %"
															customInput={Input}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="flex gap-2">
										<FormField
											control={form.control}
											name="balance.interest"
											render={({ field }) => (
												<FormItem className="w-1/2">
													<FormLabel>Juros</FormLabel>
													<FormControl>
														<NumericFormat
															prefix="R$ "
															thousandSeparator="."
															decimalSeparator=","
															fixedDecimalScale={true}
															decimalScale={2}
															value={field.value}
															onValueChange={values => {
																const numericValue = values.floatValue ?? null;

																field.onChange(numericValue);
															}}
															allowNegative={false}
															placeholder="Valor dos juros"
															customInput={Input}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="balance.interestPercentage"
											render={({ field }) => (
												<FormItem className="w-1/2">
													<FormLabel>Juros (%)</FormLabel>
													<FormControl>
														<NumericFormat
															suffix="%"
															thousandSeparator="."
															decimalSeparator=","
															fixedDecimalScale={true}
															decimalScale={2}
															value={field.value}
															onValueChange={values => {
																const numericValue = values.floatValue ?? null;

																field.onChange(numericValue);
															}}
															allowNegative={false}
															placeholder="Valor dos juros em %"
															customInput={Input}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<FormField
										control={form.control}
										name="balance.liquidValue"
										render={({ field }) => {
											return (
												<FormItem className="w-full">
													<FormLabel>Total líquido</FormLabel>
													<FormControl>
														<NumericFormat
															prefix="R$ "
															thousandSeparator="."
															decimalSeparator=","
															fixedDecimalScale={true}
															decimalScale={2}
															value={field.value}
															onValueChange={values => {
																const numericValue = values.floatValue ?? 0;

																field.onChange(numericValue);
															}}
															placeholder="Valor total"
															customInput={Input}
															readOnly
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											);
										}}
									/>
								</>
							)}
						</div>
						{/* form invoice */}
						<div className="flex w-full flex-col gap-2">
							<FormField
								control={form.control}
								name="invoice"
								render={() => (
									<FormItem className="w-full">
										<FormLabel>Nota fiscal</FormLabel>
										<FormControl>
											<div className="flex w-full items-end gap-2">
												<Input
													placeholder="Número da nota fiscal"
													{...form.register("invoice")}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{/* form due date and confirmation */}
						<div className="flex flex-col gap-2">
							<div className="flex w-full gap-2">
								<FormField
									control={form.control}
									name="dueDate"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>Data de vencimento</FormLabel>
											<FormControl>
												<DatePicker
													date={field.value}
													setDate={field.onChange}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="isConfirmed"
									render={({ field }) => (
										<FormItem className="flex w-full flex-col gap-2">
											<FormControl>
												<div className="flex h-[72px] w-full items-end justify-between">
													<Button
														type="button"
														variant="outline"
														className="w-1/5"
														onClick={() => setIsMoreDatesOpen(!isMoreDatesOpen)}
														title={
															isMoreDatesOpen ? "Mostrar menos" : "Mostrar mais"
														}
													>
														<ChevronsUpDown className="h-4 w-4" />
													</Button>
													<div className="flex h-10 w-full items-center justify-end gap-4">
														<span className="text-muted-foreground text-sm">
															Confirmar
														</span>
														<Switch
															checked={field.value}
															onCheckedChange={currentFieldValue => {
																if (currentFieldValue) {
																	form.setValue("confirmationDate", new Date());
																}

																if (!currentFieldValue) {
																	form.setValue("confirmationDate", null);
																}

																field.onChange(currentFieldValue);
															}}
														/>
													</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							{/* form registration date */}
							{isMoreDatesOpen && (
								<div
									className={cn(
										"flex w-1/2 gap-2",
										form.getValues("isConfirmed") && "w-full"
									)}
								>
									<FormField
										control={form.control}
										name="registrationDate"
										render={({ field }) => (
											<FormItem className="w-full">
												<FormLabel>Data de registro</FormLabel>
												<FormControl>
													<DatePicker
														date={field.value}
														setDate={field.onChange}
														isHour={true}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									{form.getValues("isConfirmed") && (
										<FormField
											control={form.control}
											name="confirmationDate"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormLabel>Data de confirmação</FormLabel>
													<FormControl>
														<DatePicker
															date={field.value}
															setDate={field.onChange}
															disabled={!form.getValues("isConfirmed")}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</div>
							)}
						</div>
						{/* form frequency and repeat settings */}
						<div className="flex w-full gap-2">
							<div className="flex w-full flex-col gap-2">
								<FormField
									control={form.control}
									name="frequency"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormLabel>Frequência</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={value => {
														if (value === FREQUENCY.REPEAT) {
															form.setValue(
																"repeatSettings.initialInstallment",
																1
															);
															form.setValue("repeatSettings.count", 2);
															form.setValue(
																"repeatSettings.interval",
																INTERVAL.MONTH
															);

															setIsRepeatSettingsOpen(true);
														}

														if (value !== FREQUENCY.REPEAT) {
															form.setValue("repeatSettings", null);

															setIsRepeatSettingsOpen(false);
														}

														field.onChange(value);
													}}
												>
													<SelectTrigger>
														<SelectValue placeholder="Selecione a frequência" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															{FREQUENCY_VALUES.map(frequency => (
																<SelectItem
																	key={frequency}
																	value={frequency}
																	className="hover:bg-muted"
																>
																	{frequency === FREQUENCY.DO_NOT_REPEAT &&
																		"Não recorrente"}
																	{frequency === FREQUENCY.REPEAT &&
																		"Parcelar ou repetir"}
																	{frequency === FREQUENCY.RECURRING &&
																		"Fixa mensal"}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* form repeat settings */}
								{isRepeatSettingsOpen && (
									<div className="flex flex-col gap-2">
										<FormField
											control={form.control}
											name="repeatSettings.initialInstallment"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormControl>
														<div className="flex items-center justify-between gap-2">
															<span className="text-muted-foreground text-sm">
																Parcela inicial
															</span>
															<Counter
																count={field.value}
																setCount={field.onChange}
																min={1}
															/>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="repeatSettings.count"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormControl>
														<div className="flex items-center justify-between gap-2">
															<span className="text-muted-foreground text-sm">
																Quantidade
															</span>
															<Counter
																count={field.value}
																setCount={field.onChange}
																min={2}
															/>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="repeatSettings.interval"
											render={({ field }) => (
												<FormItem className="w-full">
													<FormControl>
														<div className="flex items-center justify-between gap-2">
															<span className="w-full text-muted-foreground text-sm">
																Periodicidade
															</span>
															<div className="w-full">
																<Select
																	value={field.value}
																	onValueChange={value => {
																		field.onChange(value);
																	}}
																>
																	<SelectTrigger>
																		<SelectValue placeholder="Selecione a frequência" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectGroup>
																			{INTERVAL_VALUES.map(interval => (
																				<SelectItem
																					key={interval}
																					value={interval}
																					className="hover:bg-muted"
																				>
																					{interval === INTERVAL.MONTH &&
																						"Mensal"}
																					{interval === INTERVAL.DAY &&
																						"Diário"}
																					{interval === INTERVAL.WEEK &&
																						"Semanal"}
																					{interval === INTERVAL.YEAR &&
																						"Anual"}
																				</SelectItem>
																			))}
																		</SelectGroup>
																	</SelectContent>
																</Select>
															</div>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								)}
							</div>
							<FormField
								control={form.control}
								name="accountId"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Conta</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={value => {
													field.onChange(value);
												}}
												disabled={
													isLoadingAccounts ||
													!isSuccessAccounts ||
													isLoadingBanks ||
													!isSuccessBanks ||
													!accounts ||
													!banks
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione a conta" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														{accounts?.map(account => {
															const bank = banks?.find(
																bank => bank.id === account.bankId
															);
															const icon = bank ? getFavicon(bank.image) : "";

															return (
																<SelectItem
																	key={account.id}
																	value={account.id}
																	className="hover:bg-muted"
																>
																	<div className="flex items-center gap-2 ">
																		<Avatar className="h-4 w-4">
																			<AvatarImage
																				src={icon}
																				alt={bank?.name.slice(0, 2)}
																			/>
																			<AvatarFallback>
																				{bank?.name.slice(0, 2)}
																			</AvatarFallback>
																		</Avatar>
																		{account.name}
																	</div>
																</SelectItem>
															);
														})}
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{/* form category and sub category */}
						<div className="flex w-full gap-2">
							<FormField
								control={form.control}
								name="categoryId"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Categoria</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={value => {
													field.onChange(value);
													setSelectedCategoryId(value);
												}}
												disabled={
													isLoadingCategories ||
													!isSuccessCategories ||
													!categories
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione a conta" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														{categories?.map(category => (
															<SelectItem
																key={category.id}
																value={category.id}
																className="hover:bg-muted"
															>
																<div className="flex items-center gap-2 ">
																	<IconComponent name={category.icon} />
																	{category.name}
																</div>
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="subCategoryId"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Subcategoria</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={value => {
													field.onChange(value);
												}}
												disabled={
													isLoadingCategories ||
													!isSuccessCategories ||
													!subCategories
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione a conta" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														{subCategories?.map(subCategory => (
															<SelectItem
																key={subCategory.id}
																value={subCategory.id}
																className="hover:bg-muted"
															>
																<div className="flex items-center gap-2 ">
																	<IconComponent name={subCategory.icon} />
																	{subCategory.name}
																</div>
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						{/* form tag and sub tag */}
						{/* <div className="flex w-full gap-2">
							<FormField
								control={form.control}
								name="tagId"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Etiqueta</FormLabel>
										<FormControl>
											<MultipleSelector
												options={
													tags?.map(tag => ({
														value: tag.id,
														label: tag.name,
													})) || []
												}
												onChange={value => {
													field.onChange([...field.value, value]);
												}}
												disabled={
													isLoadingTags || !isSuccessTags || !tags || true
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="subTagId"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Sub etiqueta</FormLabel>
										<FormControl>
											<MultipleSelector
												options={
													subTags?.map(tag => ({
														value: tag.id,
														label: tag.name,
													})) || []
												}
												onChange={value => {
													field.onChange([...field.value, value]);
												}}
												disabled={
													isLoadingTags ||
													!isSuccessTags ||
													!subTags ||
													!selectedTagId ||
													true
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div> */}
					</div>
				</ScrollArea>
				'{/* form actions */}
				<div className="flex w-full items-center justify-end gap-2">
					<Button
						variant="outline"
						type="button"
						onClick={() => setComponentIsOpen(false)}
						className="w-full max-w-24"
						disabled={
							addTransactionMutation.isPending ||
							updateTransactionMutation.isPending ||
							addTransactionMutation.isSuccess ||
							updateTransactionMutation.isSuccess
						}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={
							addTransactionMutation.isPending ||
							updateTransactionMutation.isPending ||
							addTransactionMutation.isSuccess ||
							updateTransactionMutation.isSuccess ||
							isLoadingAccounts ||
							!isSuccessAccounts ||
							isLoadingCategories ||
							!isSuccessCategories ||
							isLoadingTags ||
							!isSuccessTags ||
							isLoadingBanks ||
							!isSuccessBanks ||
							isLoadingAssignments ||
							!isSuccessAssignments
						}
						className={cn(
							"w-full max-w-24",
							addTransactionMutation.isPending ||
								updateTransactionMutation.isPending
								? "max-w-32"
								: ""
						)}
					>
						{addTransactionMutation.isPending ||
						updateTransactionMutation.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Salvando...
							</>
						) : (
							"Salvar"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
};
