import { Counter } from "@/components/counter";
import { DatePicker } from "@/components/date-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import type { Account } from "@/http/accounts/get";
import { createAccount } from "@/http/accounts/post";
import { updateAccount } from "@/http/accounts/put";
import { getBanks } from "@/http/banks/get";
import { getTransactions } from "@/http/transactions/get";
import { cn } from "@/lib/utils";
import type { IAccountForm } from "@/schemas/account";
import {
	type ITransactionsForm,
	transactionsSchema,
} from "@/schemas/transactions";
import { FREQUENCY, FREQUENCY_VALUES } from "@/types/enums/frequency";
import { INTERVAL, INTERVAL_VALUES } from "@/types/enums/interval";
import type { IFormData } from "@/types/form-data";
import { getFavicon } from "@/utils/get-favicon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";

export const TransactionsForm: IFormData = ({
	type,
	setComponentIsOpen,
	id,
}) => {
	const [isMoreBalanceOpen, setIsMoreBalanceOpen] = useState(false);
	const [isRepeatSettingsOpen, setIsRepeatSettingsOpen] = useState(false);
	const [isMoreDatesOpen, setIsMoreDatesOpen] = useState(false);

	const queryClient = useQueryClient();

	const { data: transactions } = useQuery({
		queryKey: ["get-transactions"],
		queryFn: getTransactions,
	});

	const transaction = transactions?.find(transaction => transaction.id === id);

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

	const form = useForm<ITransactionsForm>({
		defaultValues: {
			type: type === "edit" ? transaction?.type : "",
			name: type === "edit" ? transaction?.name : "",
			description: type === "edit" ? transaction?.description : "",
			assignedTo: type === "edit" ? transaction?.assignedTo : "",
			supplier: type === "edit" ? transaction?.supplier : "",
			balance:
				type === "edit"
					? transaction?.balance
					: {
							value: null,
							parts: null,
							labor: null,
							discount: null,
							interest: null,
							total: null,
						},
			frequency:
				type === "edit" ? transaction?.frequency : FREQUENCY.DO_NOT_REPEAT,
			repeatSettings: type === "edit" ? transaction?.repeatSettings : null,
			dueDate: type === "edit" ? transaction?.dueDate : new Date(),
			isConfirmed: type === "edit" ? transaction?.isConfirmed : false,
			categoryId: type === "edit" ? transaction?.categoryId : "",
			subCategoryId: type === "edit" ? transaction?.subCategoryId : "",
			tagId: type === "edit" ? transaction?.tagId : "",
			subTagId: type === "edit" ? transaction?.subTagId : "",
			accountId: type === "edit" ? transaction?.accountId : "",
			registrationDate:
				type === "edit" ? transaction?.registrationDate : new Date(),
			confirmationDate: type === "edit" ? transaction?.confirmationDate : null,
		},
		resolver: zodResolver(transactionsSchema),
	});

	const addAccountMutation = useMutation({
		mutationFn: (data: IAccountForm) =>
			createAccount({
				name: data.name,
				balance: data.balance,
				bankId: data.bankId,
			}),
		onSuccess: (data: Account) => {
			queryClient.setQueryData(["get-accounts"], (accounts: Array<Account>) => {
				const newAccount: Account = {
					id: data.id,
					name: data.name,
					balance: data.balance,
					bankId: data.bankId,
				};

				const newAccounts =
					accounts?.length > 0 ? [newAccount, ...accounts] : [newAccount];

				return newAccounts;
			});
			queryClient.invalidateQueries({ queryKey: ["get-accounts"] });

			toast.success("Conta criada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar conta: ${message}`);
		},
	});

	const updateAccountMutation = useMutation({
		mutationFn: (data: IAccountForm) =>
			updateAccount({
				id: id,
				name: data.name,
				balance: data.balance,
				bankId: data.bankId,
			}),
		onSuccess: (_, data: Account) => {
			queryClient.setQueryData(["get-accounts"], (accounts: Array<Account>) => {
				const newAccount = accounts?.map(account => {
					if (account.id !== id) return account;
					const accountUpdated = {
						name: data.name,
						balance: data.balance,
						bankId: data.bankId,
					};

					return accountUpdated;
				});

				return newAccount;
			});
			queryClient.invalidateQueries({ queryKey: ["get-accounts"] });

			toast.success("Conta atualizada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar conta: ${message}`);
		},
	});

	const onSubmit = (data: ITransactionsForm) => {
		if (!form.formState.isValid) {
			toast.error("Preencha todos os campos obrigatórios");

			return;
		}

		// if (type === "add") {
		// 	addAccountMutation.mutate(data);
		// }

		// if (type === "edit") {
		// 	updateAccountMutation.mutate(data);
		// }
	};

	const balanceValue = form.watch("balance.value");
	const balanceParts = form.watch("balance.parts");
	const balanceLabor = form.watch("balance.labor");
	const balanceDiscount = form.watch("balance.discount");
	const balanceInterest = form.watch("balance.interest");

	useEffect(() => {
		if (!isMoreBalanceOpen) return;

		const total =
			(balanceValue ?? 0) +
			(balanceParts ?? 0) +
			(balanceLabor ?? 0) -
			(balanceDiscount ?? 0) +
			(balanceInterest ?? 0);

		form.setValue("balance.total", total);
	}, [
		balanceValue,
		balanceParts,
		balanceLabor,
		balanceDiscount,
		balanceInterest,
		form,
		isMoreBalanceOpen,
	]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<ScrollArea className="m-2 h-[70dvh] rounded-md border p-2">
					<div className="flex flex-col gap-4 p-2">
						<div className="flex w-full gap-2">
							<FormField
								control={form.control}
								name="name"
								render={() => (
									<FormItem className="w-full">
										<FormLabel>Nome</FormLabel>
										<FormControl>
											<Input
												placeholder="Nome da transação"
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
										<FormLabel>Descrição</FormLabel>
										<FormControl>
											<Textarea
												className="h-10 max-h-64 min-h-10"
												placeholder="Descrição da transação"
												{...form.register("description")}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex w-full gap-2">
							<FormField
								control={form.control}
								name="assignedTo"
								render={() => (
									<FormItem className="w-full">
										<FormLabel>Atribuído a</FormLabel>
										<FormControl>
											<Input
												placeholder="Nome do responsável"
												{...form.register("assignedTo")}
											/>
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
														const numericValue = values.floatValue ?? 0;

														field.onChange(numericValue);
													}}
													placeholder="Valor da transação"
													customInput={Input}
													className="w-[90%]"
												/>
												<Button
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
																const numericValue = values.floatValue ?? 0;

																field.onChange(numericValue);
															}}
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
																const numericValue = values.floatValue ?? 0;

																field.onChange(numericValue);
															}}
															placeholder="Valor da mão de obra"
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
																const numericValue = values.floatValue ?? 0;

																field.onChange(numericValue);
															}}
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
																const numericValue = values.floatValue ?? 0;

																field.onChange(numericValue);
															}}
															placeholder="Valor dos juros"
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
										name="balance.total"
										render={({ field }) => {
											return (
												<FormItem className="w-full">
													<FormLabel>Total</FormLabel>
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
							{isMoreDatesOpen && (
								<div className="flex w-full gap-2">
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
								</div>
							)}
						</div>
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
							{isRepeatSettingsOpen && (
								<div className="flex flex-col gap-2">
									<FormField
										control={form.control}
										name="repeatSettings.initialInstallment"
										render={({ field }) => (
											<FormItem className="w-full">
												{/* <FormLabel>Configurar repetição</FormLabel> */}
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
												{/* <FormLabel>Configurar repetição</FormLabel> */}
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
													<div className="flex items-center justify-between gap-4">
														<span className="w-full text-muted-foreground text-sm">
															Periodicidade
														</span>
														<div className="w-1/3">
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
																				{interval === INTERVAL.DAY && "Diário"}
																				{interval === INTERVAL.WEEK &&
																					"Semanal"}
																				{interval === INTERVAL.YEAR && "Anual"}
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
					</div>
				</ScrollArea>
				<div className="flex w-full items-center justify-end gap-2">
					<Button
						variant="outline"
						type="button"
						onClick={() => setComponentIsOpen(false)}
						className="w-full max-w-24"
						disabled={
							addAccountMutation.isPending ||
							updateAccountMutation.isPending ||
							addAccountMutation.isSuccess ||
							updateAccountMutation.isSuccess
						}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={
							!form.formState.isValid ||
							addAccountMutation.isPending ||
							updateAccountMutation.isPending ||
							addAccountMutation.isSuccess ||
							updateAccountMutation.isSuccess ||
							isLoadingBanks ||
							!isSuccessBanks ||
							true
						}
						className={cn(
							"w-full max-w-24",
							addAccountMutation.isPending || updateAccountMutation.isPending
								? "max-w-32"
								: ""
						)}
					>
						{addAccountMutation.isPending || updateAccountMutation.isPending ? (
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
