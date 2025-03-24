import { type } from "os";
import { MoreOptionsForm } from "@/app/transactions/form/_components/more-options";
import { getCustomField } from "@/app/transactions/form/_utils/get-custom-field";
import { getTagsAndSubTagsAndSetValues } from "@/app/transactions/form/_utils/get-tags-and-sub-tags-and-set-values";
import { DatePicker } from "@/components/extends-ui/date-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDateType } from "@/contexts/date-type";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { getCategories, getCategoryById } from "@/http/categories/get";
import { getCustomFields } from "@/http/custom-fields/get";
import { createTransactionEditOneRepeat } from "@/http/transactions/edit-one-repeat/post";
import type { Transaction } from "@/http/transactions/get";
import { getTransactions } from "@/http/transactions/get";
import { updateTransaction } from "@/http/transactions/put";
import { cn } from "@/lib/utils";
import { accountsKeys } from "@/queries/keys/accounts";
import { banksKeys } from "@/queries/keys/banks";
import { categoriesKeys } from "@/queries/keys/categories";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { transactionsKeys } from "@/queries/keys/transactions";
import type { ITransactionsForm } from "@/schemas/transactions";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { FREQUENCY } from "@/types/enums/frequency";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { getFavicon } from "@/utils/get-favicon";
import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Loader2, Minus, Plus } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface PaymentConfirmDialogProps {
	isPaymentConfirmDialogOpen: boolean;
	setIsPaymentConfirmDialogOpen: Dispatch<SetStateAction<boolean>>;
	id: string;
	type: "pay-actions" | "not-pay-actions" | "form";
}

export const PaymentConfirmDialog = ({
	isPaymentConfirmDialogOpen,
	setIsPaymentConfirmDialogOpen,
	id,
	type,
}: PaymentConfirmDialogProps) => {
	const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

	const queryClient = useQueryClient();

	const { month, year } = useDateWithMonthAndYear();
	const { dateType } = useDateType();

	const { data: transactions } = useQuery({
		queryKey: transactionsKeys.filter({ month, year, dateType }),
		queryFn: () => getTransactions({ month, year, dateType }),
	});

	const transaction = transactions?.find(transaction => transaction.id === id);

	const {
		data: accounts,
		isLoading: isLoadingAccounts,
		isSuccess: isSuccessAccounts,
	} = useQuery({
		queryKey: accountsKeys.filter({ month, year }),
		queryFn: () => getAccounts({ month, year }),
	});

	const {
		data: banks,
		isLoading: isLoadingBanks,
		isSuccess: isSuccessBanks,
	} = useQuery({
		queryKey: banksKeys.all,
		queryFn: getBanks,
	});

	const {
		data: tags,
		isLoading: isLoadingTags,
		isSuccess: isSuccessTags,
	} = useQuery({
		queryKey: categoriesKeys(CATEGORY_TYPE.TAG).filter({ month, year }),
		queryFn: () =>
			getCategories({
				transaction: CATEGORY_TYPE.TAG,
				month,
				year,
			}),
	});

	const tagsById = useQueries({
		queries:
			tags?.map(tag => ({
				queryKey: categoriesKeys(CATEGORY_TYPE.TAG).byId(tag.id),
				queryFn: () => getCategoryById(tag.id),
			})) || [],
	});

	const isSuccessTagsById = tagsById.every(tagById => tagById.isSuccess);
	const isLoadingTagsById = tagsById.some(tagById => tagById.isLoading);

	const {
		data: customFields,
		isLoading: isLoadingCustomFields,
		isSuccess: isSuccessCustomFields,
	} = useQuery({
		queryKey: customFieldsKeys.all,
		queryFn: () => getCustomFields(),
	});

	const form =
		type === "form"
			? useFormContext<ITransactionsForm>()
			: useForm<ITransactionsForm>({
					defaultValues: {
						type: transaction?.type,
						accountId: transaction?.accountId,
						isConfirmed: transaction?.isConfirmed,
						confirmationDate: transaction?.confirmationDate
							? new Date(transaction?.confirmationDate)
							: new Date(),
						description: transaction?.description,
						tags: null,
						subTags: null,
						customField: {},
					},
				});

	const updateTransactionMutation = useMutation({
		mutationFn: (data: ITransactionsForm) => {
			if (transaction.frequency !== FREQUENCY.DO_NOT_REPEAT) {
				return createTransactionEditOneRepeat({
					type: transaction.type,
					name: transaction.name,
					mainId: id,
					mainCount: transaction?.repeatSettings?.currentCount,
					description: transaction?.description,
					assignedTo: transaction?.assignedTo,
					supplier: transaction?.supplier,
					balance: {
						value: transaction?.balance.value,
						discount: transaction?.balance.discount,
						discountPercentage: transaction?.balance.discountPercentage,
						interest: transaction?.balance.interest,
						interestPercentage: transaction?.balance.interestPercentage,
					},
					frequency: transaction?.frequency,
					repeatSettings:
						data.frequency === FREQUENCY.REPEAT
							? {
									initialInstallment:
										transaction?.repeatSettings?.initialInstallment,
									count: transaction?.repeatSettings?.count,
									interval: transaction?.repeatSettings?.interval,
								}
							: null,
					dueDate: transaction?.dueDate,
					isConfirmed: data.isConfirmed,
					categoryId: transaction?.categoryId,
					subCategoryId: transaction?.subCategoryId,
					tags: data.tagsAndSubTags,
					accountId: data.accountId,
					registrationDate: transaction?.registrationDate,
					confirmationDate: data.confirmationDate?.toISOString() || null,
					customFields:
						data.customField && Object.keys(data.customField).length > 0
							? Object.entries(data.customField).map(([key, value]) => ({
									id: key,
									value: value.fieldValue,
								}))
							: [],
				});
			}

			return updateTransaction({
				id: id,
				type: transaction?.type,
				name: transaction?.name,
				description: transaction?.description,
				assignedTo: transaction?.assignedTo,
				supplier: transaction?.supplier,
				balance: {
					value: transaction?.balance.value,
					discount: transaction?.balance.discount,
					discountPercentage: transaction?.balance.discountPercentage,
					interest: transaction?.balance.interest,
					interestPercentage: transaction?.balance.interestPercentage,
				},
				frequency: transaction?.frequency,
				repeatSettings: null,
				dueDate: transaction?.dueDate,
				isConfirmed: data.isConfirmed,
				categoryId: transaction?.categoryId,
				subCategoryId: transaction?.subCategoryId,
				tags: data.tagsAndSubTags,
				accountId: data.accountId,
				registrationDate: transaction?.registrationDate,
				confirmationDate: data.confirmationDate?.toISOString() || null,
				customFields:
					data.customField && Object.keys(data.customField).length > 0
						? Object.entries(data.customField).map(([key, value]) => ({
								id: key,
								value: value.fieldValue,
							}))
						: [],
			});
		},
		onSuccess: (data: Transaction) => {
			queryClient.setQueryData(
				transactionsKeys.filter({ month, year, dateType }),
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
								discount: data.balance.discount,
								discountPercentage: data.balance.discountPercentage,
								interest: data.balance.interest,
								interestPercentage: data.balance.interestPercentage,
							},
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
							tags: data.tags,
							accountId: data.accountId,
							registrationDate: data.registrationDate,
							confirmationDate: data.confirmationDate ?? null,
							customFields: data.customFields,
						};

						return transactionUpdated;
					});

					return newTransaction;
				}
			);
			queryClient.invalidateQueries({
				queryKey: transactionsKeys.filter({ month, year, dateType }),
			});

			toast.success(
				`Transação marcada como ${
					type === "not-pay-actions" || (isConfirmedWatch && type === "form")
						? "não"
						: ""
				} ${
					transactionType === TRANSACTION_TYPE.EXPENSE ? "paga" : "recebida"
				} com sucesso`
			);
			form.reset();
			updateTransactionMutation.reset();

			setIsPaymentConfirmDialogOpen(false);
		},
		onError: ({ message }) => {
			toast.error(
				`Erro ao marcar transação como ${
					type === "not-pay-actions" || (isConfirmedWatch && type === "form")
						? "não"
						: ""
				} ${
					transaction?.type === TRANSACTION_TYPE.EXPENSE ? "paga" : "recebida"
				}: ${message}`
			);
		},
	});

	const onSubmit = (data: ITransactionsForm) => {
		if (Object.keys(form.formState.errors).length > 0) {
			toast.error("Formulário inválido!");

			return;
		}

		if (type === "form") return;

		const { tags, subTags, ...dataWithoutTagsAndSubTags } = data;
		const dataWithTagsAndSubTags = dataWithoutTagsAndSubTags;

		dataWithTagsAndSubTags.tagsAndSubTags = tags?.map(tag => ({
			tagId: tag.value,
		}));

		dataWithTagsAndSubTags.tagsAndSubTags =
			dataWithTagsAndSubTags.tagsAndSubTags?.concat(
				subTags?.map(subTag => ({
					tagId: subTag.tagId,
					subTagId: subTag.value,
				}))
			);

		updateTransactionMutation.mutate(dataWithTagsAndSubTags);
	};

	const transactionType = form.getValues("type");

	const isConfirmedWatch = form.watch("isConfirmed");

	const tagsWatch = form.watch("tags");
	const subTagsWatch = form.watch("subTags");

	const customFieldWatch = form.watch("customField");

	useEffect(() => {
		if (
			!transaction ||
			type === "not-pay-actions" ||
			(isConfirmedWatch && type === "form") ||
			isLoadingTags ||
			!isSuccessTags ||
			isLoadingTagsById ||
			!isSuccessTagsById ||
			tagsWatch !== null ||
			subTagsWatch !== null
		)
			return;

		getTagsAndSubTagsAndSetValues({
			transaction,
			tagsById: tagsById.map(tagById => tagById.data),
			setValue: form.setValue,
		});
	}, [
		transaction,
		form.setValue,
		isConfirmedWatch,
		type,
		tagsById,
		isLoadingTagsById,
		isSuccessTagsById,
		tagsWatch,
		subTagsWatch,
		isLoadingTags,
		isSuccessTags,
	]);

	useEffect(() => {
		if (
			!transaction ||
			type === "not-pay-actions" ||
			(isConfirmedWatch && type === "form")
		)
			return;

		getCustomField({
			transaction,
			customFields,
			setValue: form.setValue,
		});
	}, [transaction, type, form.setValue, customFields, isConfirmedWatch]);

	useEffect(() => {
		if (type === "not-pay-actions") return;

		if (isLoadingCustomFields) return;

		if (!isSuccessCustomFields && !isLoadingCustomFields) return;

		if (customFields == null || customFields?.length === 0) return;

		const hasRequiredCustomFields = customFields.some(
			customField => customField.required
		);

		if (hasRequiredCustomFields) setIsMoreOptionsOpen(true);
	}, [customFields, isLoadingCustomFields, isSuccessCustomFields, type]);

	useEffect(() => {
		if (
			!transaction ||
			type === "not-pay-actions" ||
			(isConfirmedWatch && type === "form")
		)
			return;

		if (transaction.tags.length > 0) setIsMoreOptionsOpen(true);

		if (transaction.description) setIsMoreOptionsOpen(true);
	}, [transaction, type, isConfirmedWatch]);

	useEffect(() => {
		if (type === "form" || type === "not-pay-actions") return;

		const hasError = !isSuccessAccounts && !isLoadingAccounts;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar contas");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessAccounts, isLoadingAccounts, type]);

	useEffect(() => {
		if (type === "form" || type === "not-pay-actions") return;

		const hasError = !isSuccessBanks && !isLoadingBanks;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar bancos");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessBanks, isLoadingBanks, type]);

	useEffect(() => {
		if (type === "form" || type === "not-pay-actions") return;

		const hasError = !isSuccessTags && !isLoadingTags && !tags;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar etiquetas");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessTags, isLoadingTags, tags, type]);

	useEffect(() => {
		const hasError = !isSuccessTagsById && !isLoadingTagsById;

		if (hasError) {
			const tagsByIdWithError = tagsById.filter(
				tagById => !tagById.isSuccess && !tagById.isLoading
			);

			// biome-ignore lint/complexity/noForEach: <explanation>
			tagsByIdWithError.forEach(() => {
				const timeoutId = setTimeout(() => {
					toast.error("Erro ao carregar etiqueta");
				}, 0);

				return () => clearTimeout(timeoutId);
			});
		}
	}, [isSuccessTagsById, isLoadingTagsById, tagsById]);

	useEffect(() => {
		if (type === "form" || type === "not-pay-actions") return;

		const hasError = !isSuccessCustomFields && !isLoadingCustomFields;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar campos personalizados");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessCustomFields, isLoadingCustomFields, type]);

	return (
		<Dialog
			open={isPaymentConfirmDialogOpen}
			onOpenChange={isOpen => {
				if (!isOpen) {
					setIsPaymentConfirmDialogOpen(false);

					if (type === "form") {
						form.setValue("confirmationDate", null);
					}
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{`Marcar transação como ${
							type === "not-pay-actions" ||
							(isConfirmedWatch && type === "form")
								? "não"
								: ""
						} ${transactionType === TRANSACTION_TYPE.EXPENSE ? "paga" : "recebida"}`}
					</DialogTitle>
					<DialogDescription>
						{`Marque a transação como ${
							type === "not-pay-actions" ||
							(isConfirmedWatch && type === "form")
								? "não"
								: ""
						} ${transactionType === TRANSACTION_TYPE.EXPENSE ? "paga" : "recebida"}`}{" "}
						clicando no botão abaixo.
					</DialogDescription>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex flex-col gap-4"
						>
							{type === "pay-actions" ||
							(!isConfirmedWatch && type === "form") ? (
								<div className="flex flex-col gap-4">
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
																	const icon = bank
																		? getFavicon(bank.image)
																		: "";

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
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Separator className="my-2" />
									<Collapsible
										open={isMoreOptionsOpen}
										onOpenChange={open => {
											if (!open) {
												setIsMoreOptionsOpen(false);
											}
										}}
										className="flex flex-col items-start gap-2"
									>
										<CollapsibleTrigger asChild>
											<Button
												variant="ghost"
												onClick={() => setIsMoreOptionsOpen(true)}
												className="p-0 font-semibold text-md hover:bg-transparent focus:bg-transparent"
											>
												{isMoreOptionsOpen ? (
													<Minus className="text-muted-foreground" />
												) : (
													<Plus className="text-muted-foreground" />
												)}
												<span>
													{isMoreOptionsOpen ? "Menos opções" : "Mais opções"}
												</span>
											</Button>
										</CollapsibleTrigger>
										<CollapsibleContent className="w-full">
											<MoreOptionsForm
												id={id}
												transactionType={transactionType}
											/>
										</CollapsibleContent>
									</Collapsible>
								</div>
							) : (
								<></>
							)}
							<div
								className={cn(
									"flex w-full items-center justify-end gap-2",
									type === "not-pay-actions" ||
										(isConfirmedWatch && type === "form")
										? "pt-4"
										: ""
								)}
							>
								<Button
									variant="outline"
									type="button"
									onClick={() => setIsPaymentConfirmDialogOpen(false)}
									className="w-full max-w-24"
									disabled={
										updateTransactionMutation.isPending ||
										updateTransactionMutation.isSuccess
									}
								>
									Cancelar
								</Button>
								<Button
									variant={
										type === "not-pay-actions" ||
										(isConfirmedWatch && type === "form")
											? "destructive"
											: "default"
									}
									type={type === "form" ? "button" : "submit"}
									disabled={
										updateTransactionMutation.isPending ||
										updateTransactionMutation.isSuccess ||
										isLoadingAccounts ||
										!isSuccessAccounts ||
										isLoadingTags ||
										!isSuccessTags ||
										isLoadingTagsById ||
										!isSuccessTagsById ||
										isLoadingBanks ||
										!isSuccessBanks ||
										tagsWatch === null ||
										subTagsWatch === null ||
										customFieldWatch === null
									}
									className={cn(
										"w-full max-w-28",
										isConfirmedWatch &&
											transactionType === TRANSACTION_TYPE.RECIPE
											? "max-w-32"
											: "",
										updateTransactionMutation.isPending ? "max-w-40" : ""
									)}
									onClick={() => {
										if (type === "pay-actions") {
											form.setValue("isConfirmed", true);
										}

										if (type === "not-pay-actions") {
											form.setValue("isConfirmed", false);
											form.setValue("confirmationDate", null);
										}

										if (type === "form") {
											if (isConfirmedWatch) {
												form.setValue("isConfirmed", false);
												form.setValue("confirmationDate", null);
											}

											if (!isConfirmedWatch) {
												form.setValue("isConfirmed", true);
											}

											toast.success(
												`Transação marcada como ${isConfirmedWatch ? "não" : ""} ${
													transactionType === TRANSACTION_TYPE.EXPENSE
														? "paga"
														: "recebida"
												} com sucesso, por favor salve as alterações para continuar`,
												{
													duration: 5000,
												}
											);

											setIsPaymentConfirmDialogOpen(false);
										}
									}}
								>
									{updateTransactionMutation.isPending ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Processando...
										</>
									) : transactionType === TRANSACTION_TYPE.EXPENSE ? (
										type === "not-pay-actions" ||
										(isConfirmedWatch && type === "form") ? (
											"Não paga"
										) : (
											"Pagar"
										)
									) : type === "not-pay-actions" ||
										(isConfirmedWatch && type === "form") ? (
										"Não recebida"
									) : (
										"Receber"
									)}
								</Button>
							</div>
						</form>
					</Form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};
