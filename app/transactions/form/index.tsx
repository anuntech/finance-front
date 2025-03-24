import { PaymentConfirmDialog } from "@/components/actions/payment-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDateType } from "@/contexts/date-type";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useAssignments } from "@/hooks/assignments";
import { getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { getCategories, getCategoryById } from "@/http/categories/get";
import { getCustomFields } from "@/http/custom-fields/get";
import { createTransactionEditOneRepeat } from "@/http/transactions/edit-one-repeat/post";
import { type Transaction, getTransactions } from "@/http/transactions/get";
import { createTransaction } from "@/http/transactions/post";
import { updateTransaction } from "@/http/transactions/put";
import { cn } from "@/lib/utils";
import { accountsKeys } from "@/queries/keys/accounts";
import { banksKeys } from "@/queries/keys/banks";
import { categoriesKeys } from "@/queries/keys/categories";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { transactionsKeys } from "@/queries/keys/transactions";
import {
	type ITransactionsForm,
	transactionsSchema,
} from "@/schemas/transactions";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { FREQUENCY } from "@/types/enums/frequency";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { IFormData } from "@/types/form-data";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ConfirmDialog } from "./_components/confirm-dialog";
import { MainForm } from "./_components/main";
import { MoreOptionsForm } from "./_components/more-options";
import { PaymentConditionsForm } from "./_components/payment-conditions";
import { ValuesForm } from "./_components/values";
import { getCustomField } from "./_utils/get-custom-field";
import { getTagsAndSubTagsAndSetValues } from "./_utils/get-tags-and-sub-tags-and-set-values";

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
	const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
	const [confirmDialogIsOpen, setConfirmDialogIsOpen] = useState(false);
	const [paymentConfirmDialogIsOpen, setPaymentConfirmDialogIsOpen] =
		useState(false);

	const queryClient = useQueryClient();

	const { date, month, year } = useDateWithMonthAndYear();
	const { dateType } = useDateType();

	const { data: transactions } = useQuery({
		queryKey: transactionsKeys.filter({ month, year, dateType }),
		queryFn: () => getTransactions({ month, year, dateType }),
	});

	const transaction = transactions?.find(transaction => transaction.id === id);

	const { isLoading: isLoadingAccounts, isSuccess: isSuccessAccounts } =
		useQuery({
			queryKey: accountsKeys.filter({ month, year }),
			queryFn: () => getAccounts({ month, year }),
		});

	const { isLoading: isLoadingBanks, isSuccess: isSuccessBanks } = useQuery({
		queryKey: banksKeys.all,
		queryFn: getBanks,
	});

	const { isLoading: isLoadingCategories, isSuccess: isSuccessCategories } =
		useQuery({
			queryKey: categoriesKeys(
				getCategoryType(type === "edit" ? transaction?.type : transactionType)
			).filter({ month, year }),
			queryFn: () =>
				getCategories({
					transaction: getCategoryType(
						type === "edit" ? transaction?.type : transactionType
					),
					month,
					year,
				}),
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

	const workspaceId =
		typeof window !== "undefined" ? localStorage.getItem("workspaceId") : "";

	const { isLoadingAssignments, isSuccessAssignments, assignments } =
		useAssignments(workspaceId);

	const [user] = assignments;

	const form = useForm<ITransactionsForm>({
		defaultValues: {
			type: type === "edit" ? transaction?.type : transactionType,
			name: type === "edit" ? transaction?.name : "",
			description: type === "edit" ? transaction?.description : "",
			assignedTo: type === "edit" ? transaction?.assignedTo : user?.id,
			supplier: type === "edit" ? transaction?.supplier : "",
			balance:
				type === "edit"
					? {
							value: transaction?.balance.value,
							discount: {
								value:
									transaction?.balance.discount ||
									transaction?.balance.discountPercentage ||
									null,
								type: transaction?.balance.discountPercentage
									? "percentage"
									: "value",
							},
							interest: {
								value:
									transaction?.balance.interest ||
									transaction?.balance.interestPercentage ||
									null,
								type: transaction?.balance.interestPercentage
									? "percentage"
									: "value",
							},
							liquidValue:
								transaction?.balance.value -
								(transaction?.balance.discount ?? 0) -
								(transaction?.balance.value *
									(transaction?.balance.discountPercentage ?? 0)) /
									100 +
								transaction?.balance.interest +
								(transaction?.balance.value *
									(transaction?.balance.interestPercentage ?? 0)) /
									100,
						}
					: {
							value: null,
							discount: {
								value: null,
								type: "value",
							},
							interest: {
								value: null,
								type: "value",
							},
							liquidValue: null,
						},
			frequency:
				type === "edit" ? transaction?.frequency : FREQUENCY.DO_NOT_REPEAT,
			repeatSettings:
				type === "edit"
					? transaction?.frequency === FREQUENCY.REPEAT
						? transaction?.repeatSettings
						: null
					: null,
			dueDate: type === "edit" ? new Date(transaction?.dueDate) : date,
			isConfirmed: type === "edit" ? transaction?.isConfirmed : false,
			categoryId: type === "edit" ? transaction?.categoryId : "",
			subCategoryId: type === "edit" ? transaction?.subCategoryId : "",
			tagsAndSubTags: [],
			tags: type === "edit" ? null : [],
			subTags: type === "edit" ? null : [],
			accountId: type === "edit" ? transaction?.accountId : "",
			registrationDate:
				type === "edit" ? new Date(transaction?.registrationDate) : new Date(),
			confirmationDate:
				type === "edit"
					? transaction?.confirmationDate
						? new Date(transaction?.confirmationDate)
						: null
					: null,
			customField: type === "edit" ? null : {},
		},
		resolver: zodResolver(transactionsSchema),
	});

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
					discount:
						data.balance.discount?.type === "value"
							? data.balance.discount?.value
							: null,
					discountPercentage:
						data.balance.discount?.type === "percentage"
							? data.balance.discount?.value
							: null,
					interest:
						data.balance.interest?.type === "value"
							? data.balance.interest?.value
							: null,
					interestPercentage:
						data.balance.interest?.type === "percentage"
							? data.balance.interest?.value
							: null,
				},
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
				tags: data.tagsAndSubTags,
				accountId: data.accountId,
				registrationDate: data.registrationDate.toISOString(),
				confirmationDate: data.confirmationDate?.toISOString() || null,
				customFields:
					data.customField && Object.keys(data.customField).length > 0
						? Object.entries(data.customField).map(([key, value]) => ({
								id: key,
								value: value.fieldValue,
							}))
						: [],
			}),
		onSuccess: (data: Transaction) => {
			queryClient.setQueryData(
				transactionsKeys.filter({ month, year, dateType }),
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
							discount: data.balance.discount,
							discountPercentage: data.balance.discountPercentage,
							interest: data.balance.interest,
							interestPercentage: data.balance.interestPercentage,
							netBalance: data.balance.netBalance,
						},
						frequency: data.frequency,
						repeatSettings:
							data.frequency === FREQUENCY.REPEAT
								? {
										initialInstallment: data.repeatSettings?.initialInstallment,
										count: data.repeatSettings?.count,
										interval: data.repeatSettings?.interval,
										currentCount: data.repeatSettings?.currentCount,
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

					const newTransactions =
						transactions?.length > 0
							? [newTransaction, ...transactions]
							: [newTransaction];

					return newTransactions;
				}
			);
			queryClient.invalidateQueries({
				queryKey: transactionsKeys.filter({ month, year, dateType }),
			});

			toast.success("Transação criada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar transação: ${message}`);
		},
	});

	const updateTransactionMutation = useMutation({
		mutationFn: (data: ITransactionsForm) => {
			if (data.frequency !== FREQUENCY.DO_NOT_REPEAT) {
				return createTransactionEditOneRepeat({
					type: data.type,
					name: data.name,
					mainId: id,
					mainCount: transaction?.repeatSettings?.currentCount,
					description: data.description,
					assignedTo: data.assignedTo,
					supplier: data.supplier,
					balance: {
						value: data.balance.value,
						discount:
							data.balance.discount?.type === "value"
								? data.balance.discount?.value
								: null,
						discountPercentage:
							data.balance.discount?.type === "percentage"
								? data.balance.discount?.value
								: null,
						interest:
							data.balance.interest?.type === "value"
								? data.balance.interest?.value
								: null,
						interestPercentage:
							data.balance.interest?.type === "percentage"
								? data.balance.interest?.value
								: null,
					},
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
					tags: data.tagsAndSubTags,
					accountId: data.accountId,
					registrationDate: data.registrationDate.toISOString(),
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
				type: data.type,
				name: data.name,
				description: data.description,
				assignedTo: data.assignedTo,
				supplier: data.supplier,
				balance: {
					value: data.balance.value,
					discount:
						data.balance.discount?.type === "value"
							? data.balance.discount?.value
							: null,
					discountPercentage:
						data.balance.discount?.type === "percentage"
							? data.balance.discount?.value
							: null,
					interest:
						data.balance.interest?.type === "value"
							? data.balance.interest?.value
							: null,
					interestPercentage:
						data.balance.interest?.type === "percentage"
							? data.balance.interest?.value
							: null,
				},
				frequency: data.frequency,
				repeatSettings: null,
				dueDate: data.dueDate.toISOString(),
				isConfirmed: data.isConfirmed,
				categoryId: data.categoryId,
				subCategoryId: data.subCategoryId,
				tags: data.tagsAndSubTags,
				accountId: data.accountId,
				registrationDate: data.registrationDate.toISOString(),
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
							id: data.id,
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
								netBalance: data.balance.netBalance,
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

			toast.success("Transação atualizada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar transação: ${message}`);
		},
	});

	const onSubmit = (data: ITransactionsForm) => {
		if (Object.keys(form.formState.errors).length > 0) {
			toast.error("Formulário inválido!");

			return;
		}

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

		if (type === "add") {
			addTransactionMutation.mutate(dataWithTagsAndSubTags);
		}

		if (type === "edit") {
			updateTransactionMutation.mutate(dataWithTagsAndSubTags);
		}
	};

	const isConfirmedWatch = form.watch("isConfirmed");

	const balanceValueWatch = form.watch("balance.value");
	const balanceDiscountWatch = form.watch("balance.discount.value");
	const balanceDiscountTypeWatch = form.watch("balance.discount.type");
	const balanceInterestWatch = form.watch("balance.interest.value");
	const balanceInterestTypeWatch = form.watch("balance.interest.type");
	const balanceLiquidValueWatch = form.watch("balance.liquidValue");

	const tagsWatch = form.watch("tags");
	const subTagsWatch = form.watch("subTags");

	const customFieldWatch = form.watch("customField");

	useEffect(() => {
		if (balanceValueWatch === null) {
			if (balanceDiscountWatch !== null) {
				form.setValue("balance.discount.value", null);
			}

			if (balanceInterestWatch !== null) {
				form.setValue("balance.interest.value", null);
			}

			if (balanceLiquidValueWatch !== null) {
				form.setValue("balance.liquidValue", null);
			}

			return;
		}

		let discount = balanceDiscountWatch ?? 0;
		let interest = balanceInterestWatch ?? 0;

		if (balanceDiscountTypeWatch === "percentage") {
			discount = (balanceValueWatch * (balanceDiscountWatch ?? 0)) / 100;
		}

		const balanceWithDiscount = balanceValueWatch - discount;

		if (balanceInterestTypeWatch === "percentage") {
			interest = (balanceWithDiscount * (balanceInterestWatch ?? 0)) / 100;
		}

		const liquidValue = balanceWithDiscount + interest;

		form.setValue("balance.liquidValue", liquidValue);
	}, [
		balanceValueWatch,
		balanceDiscountWatch,
		balanceDiscountTypeWatch,
		balanceInterestWatch,
		balanceInterestTypeWatch,
		balanceLiquidValueWatch,
		form,
	]);

	useEffect(() => {
		if (
			type !== "edit" ||
			!transaction ||
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
		type,
		form.setValue,
		tagsById,
		tagsWatch,
		subTagsWatch,
		isLoadingTags,
		isSuccessTags,
		isLoadingTagsById,
		isSuccessTagsById,
	]);

	useEffect(() => {
		if (type !== "edit" || !transaction) return;

		getCustomField({
			transaction,
			customFields,
			setValue: form.setValue,
		});

		if (customFields == null || customFields?.length === 0) return;

		for (const customField of customFields) {
			const customFieldById = form.getValues(`customField.${customField.id}`);

			if (customFieldById?.fieldValue) setIsMoreOptionsOpen(true);
		}
	}, [transaction, type, form.setValue, customFields, form.getValues]);

	useEffect(() => {
		if (isLoadingCustomFields) return;

		if (!isSuccessCustomFields && !isLoadingCustomFields) return;

		if (customFields?.length > 0) {
			const hasRequiredCustomFields = customFields.some(
				customField => customField.required
			);

			if (hasRequiredCustomFields) setIsMoreOptionsOpen(true);
		}
	}, [customFields, isLoadingCustomFields, isSuccessCustomFields]);

	useEffect(() => {
		if (type !== "edit" || !transaction) return;

		if (transaction.tags.length > 0) setIsMoreOptionsOpen(true);

		if (transaction.description) setIsMoreOptionsOpen(true);
	}, [transaction, type]);

	useEffect(() => {
		const hasError = !isSuccessAccounts && !isLoadingAccounts;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar contas");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessAccounts, isLoadingAccounts]);

	useEffect(() => {
		const hasError = !isSuccessBanks && !isLoadingBanks;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar bancos");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessBanks, isLoadingBanks]);

	useEffect(() => {
		const hasError = !isSuccessCategories && !isLoadingCategories;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar categorias");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessCategories, isLoadingCategories]);

	useEffect(() => {
		const hasError = !isSuccessTags && !isLoadingTags && !tags;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar etiquetas");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessTags, isLoadingTags, tags]);

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
		const hasError = !isSuccessCustomFields && !isLoadingCustomFields;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar campos personalizados");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessCustomFields, isLoadingCustomFields]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<ScrollArea className="h-[70dvh] rounded-md border p-2">
					<div className="flex flex-col gap-4 p-2">
						<MainForm type={type} id={id} transactionType={transactionType} />
						<Separator className="my-2" />
						<PaymentConditionsForm type={type} id={id} />
						<ValuesForm />
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
								<MoreOptionsForm id={id} transactionType={transactionType} />
							</CollapsibleContent>
						</Collapsible>
					</div>
				</ScrollArea>
				<div className="flex w-full items-center justify-between gap-2">
					<Button
						type="button"
						variant={isConfirmedWatch ? "destructive" : "default"}
						onClick={() => {
							setPaymentConfirmDialogIsOpen(true);

							form.setValue("confirmationDate", new Date());
						}}
					>
						Marcar como {isConfirmedWatch ? "não" : ""}{" "}
						{transactionType === TRANSACTION_TYPE.EXPENSE ? "paga" : "recebida"}
					</Button>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							type="button"
							onClick={() => {
								setComponentIsOpen(false);

								form.setValue(
									"confirmationDate",
									isConfirmedWatch ? null : new Date()
								);
							}}
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
							type={
								type === "edit" &&
								transaction?.frequency !== FREQUENCY.DO_NOT_REPEAT
									? "button"
									: "submit"
							}
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
								isLoadingTagsById ||
								!isSuccessTagsById ||
								isLoadingBanks ||
								!isSuccessBanks ||
								isLoadingAssignments ||
								!isSuccessAssignments ||
								tagsWatch === null ||
								subTagsWatch === null ||
								customFieldWatch === null
							}
							className={cn(
								"w-full max-w-24",
								addTransactionMutation.isPending ||
									updateTransactionMutation.isPending
									? "max-w-32"
									: ""
							)}
							onClick={() => {
								if (
									type === "edit" &&
									transaction?.frequency !== FREQUENCY.DO_NOT_REPEAT
								)
									setConfirmDialogIsOpen(true);
							}}
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
						<PaymentConfirmDialog
							isPaymentConfirmDialogOpen={paymentConfirmDialogIsOpen}
							setIsPaymentConfirmDialogOpen={setPaymentConfirmDialogIsOpen}
							id={id}
							type="form"
						/>
						<ConfirmDialog
							confirmDialogIsOpen={confirmDialogIsOpen}
							setConfirmDialogIsOpen={setConfirmDialogIsOpen}
							onSubmit={onSubmit}
						/>
					</div>
				</div>
			</form>
		</Form>
	);
};
