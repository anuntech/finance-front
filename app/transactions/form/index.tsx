import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useAssignments } from "@/hooks/assignments";
import { getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { getCategories, getCategoryById } from "@/http/categories/get";
import { type Transaction, getTransactions } from "@/http/transactions/get";
import { createTransaction } from "@/http/transactions/post";
import { updateTransaction } from "@/http/transactions/put";
import { cn } from "@/lib/utils";
import {
	type ITransactionsForm,
	transactionsSchema,
} from "@/schemas/transactions";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { FREQUENCY } from "@/types/enums/frequency";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { IFormData } from "@/types/form-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MainForm } from "./_components/main";
import { MoreOptionsForm } from "./_components/more-options";
import { PaymentForm } from "./_components/payment";
import { PaymentConditionsForm } from "./_components/payment-conditions";

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

	const queryClient = useQueryClient();

	const { date } = useDateWithMonthAndYear();

	const { month, year } = date;

	const { data: transactions } = useQuery({
		queryKey: ["get-transactions"],
		queryFn: () => getTransactions({ month, year }),
	});

	const transaction = transactions?.find(transaction => transaction.id === id);

	const { isLoading: isLoadingAccounts, isSuccess: isSuccessAccounts } =
		useQuery({
			queryKey: ["get-accounts"],
			queryFn: () => getAccounts({ month, year }),
		});

	if (!isSuccessAccounts && !isLoadingAccounts) {
		toast.error("Erro ao carregar contas");
	}

	const { isLoading: isLoadingBanks, isSuccess: isSuccessBanks } = useQuery({
		queryKey: ["get-banks"],
		queryFn: getBanks,
	});

	if (!isSuccessBanks && !isLoadingBanks) {
		toast.error("Erro ao carregar bancos");
	}

	const { isLoading: isLoadingCategories, isSuccess: isSuccessCategories } =
		useQuery({
			queryKey: [
				`get-${getCategoryType(
					type === "edit" ? transaction?.type : transactionType
				).toLowerCase()}s`,
			],
			queryFn: () =>
				getCategories({
					transaction: getCategoryType(
						type === "edit" ? transaction?.type : transactionType
					),
					month,
					year,
				}),
		});

	if (!isSuccessCategories && !isLoadingCategories) {
		toast.error("Erro ao carregar categorias");
	}

	const {
		data: tags,
		isLoading: isLoadingTags,
		isSuccess: isSuccessTags,
	} = useQuery({
		queryKey: ["get-tags"],
		queryFn: () =>
			getCategories({
				transaction: CATEGORY_TYPE.TAG,
				month,
				year,
			}),
	});

	if (!isSuccessTags && !isLoadingTags && !tags) {
		toast.error("Erro ao carregar etiquetas");
	}

	const workspaceId =
		typeof window !== "undefined" ? localStorage.getItem("workspaceId") : "";

	const { isLoadingAssignments, isSuccessAssignments } =
		useAssignments(workspaceId);

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
			tagsAndSubTags: [],
			tags: type === "edit" ? null : [],
			subTags: type === "edit" ? null : [],
			accountId:
				type === "edit" ? (transaction?.accountId ?? undefined) : undefined,
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
				tags: data.tagsAndSubTags,
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
						tags: data.tags,
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
				tags: data.tagsAndSubTags,
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
							tags: data.tags,
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

	const onSubmit = (data: ITransactionsForm) => {
		if (Object.keys(form.formState.errors).length > 0) {
			toast.error("Formulário inválido!");

			return;
		}

		const { tags, subTags, ...restData } = data;
		const dataWithTagsAndSubTagsOrganized = restData;

		dataWithTagsAndSubTagsOrganized.tagsAndSubTags = tags?.map(tag => ({
			tagId: tag.value,
		}));

		dataWithTagsAndSubTagsOrganized.tagsAndSubTags =
			dataWithTagsAndSubTagsOrganized.tagsAndSubTags?.concat(
				subTags?.map(subTag => ({
					tagId: subTag.tagId,
					subTagId: subTag.value,
				}))
			);

		if (type === "add") {
			addTransactionMutation.mutate(dataWithTagsAndSubTagsOrganized);
		}

		if (type === "edit") {
			updateTransactionMutation.mutate(dataWithTagsAndSubTagsOrganized);
		}
	};

	const isConfirmedWatch = form.watch("isConfirmed");
	const balanceValueWatch = form.watch("balance.value");
	const balancePartsWatch = form.watch("balance.parts");
	const balanceLaborWatch = form.watch("balance.labor");
	const balanceDiscountWatch = form.watch("balance.discount");
	const balanceInterestWatch = form.watch("balance.interest");
	const balanceDiscountPercentageWatch = form.watch(
		"balance.discountPercentage"
	);
	const balanceInterestPercentageWatch = form.watch(
		"balance.interestPercentage"
	);
	const tagsWatch = form.watch("tags");
	const subTagsWatch = form.watch("subTags");

	useEffect(() => {
		const grossValue =
			(balanceValueWatch ?? 0) +
			(balancePartsWatch ?? 0) +
			(balanceLaborWatch ?? 0);
		const discountPercentageCalculated =
			(grossValue * (balanceDiscountPercentageWatch ?? 0)) / 100;
		const interestPercentageCalculated =
			(grossValue * (balanceInterestPercentageWatch ?? 0)) / 100;
		const liquidValue =
			grossValue -
			(balanceDiscountWatch ?? 0) -
			discountPercentageCalculated +
			(balanceInterestWatch ?? 0) +
			interestPercentageCalculated;

		form.setValue("balance.grossValue", grossValue);
		form.setValue("balance.liquidValue", liquidValue);
	}, [
		balanceValueWatch,
		balancePartsWatch,
		balanceLaborWatch,
		balanceDiscountWatch,
		balanceInterestWatch,
		balanceDiscountPercentageWatch,
		balanceInterestPercentageWatch,
		form,
	]);

	useEffect(() => {
		if (isConfirmedWatch) {
			setIsMoreOptionsOpen(true);
		}

		if (!isConfirmedWatch) {
			setIsMoreOptionsOpen(false);
		}
	}, [isConfirmedWatch]);

	useEffect(() => {
		if (type !== "edit" || !transaction) return;

		const getTagsAndSubTagsAndSetValues = async () => {
			const tags: Array<{
				value: string;
				label: string;
				icon: string;
			}> = [];
			const subTags: Array<{
				tagId: string;
				value: string;
				label: string;
				icon: string;
			}> = [];

			for (const tag of transaction.tags) {
				const tagById = await getCategoryById(tag.tagId);

				if (!tagById) {
					toast.error("Erro ao carregar etiqueta");
				}

				if (tag.subTagId === "000000000000000000000000") {
					const tagSelected = {
						value: tagById?.id,
						label: tagById?.name,
						icon: tagById?.icon,
					};

					tags.push(tagSelected);
				}

				if (tag.subTagId !== "000000000000000000000000") {
					const subTagById = tagById?.subCategories?.find(
						subCategory => tag.subTagId === subCategory.id
					);

					const subTagSelected = {
						tagId: tagById?.id,
						value: subTagById?.id,
						label: subTagById?.name,
						icon: subTagById?.icon,
					};

					subTags.push(subTagSelected);
				}
			}

			form.setValue("tags", tags || []);

			form.setValue("subTags", subTags || []);
		};

		getTagsAndSubTagsAndSetValues();
	}, [transaction, type, form.setValue]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<ScrollArea className="m-2 h-[70dvh] rounded-md border p-2">
					<div className="flex flex-col gap-4 p-2">
						<MainForm type={type} id={id} transactionType={transactionType} />
						<Separator className="my-2" />
						<PaymentConditionsForm />
						{isConfirmedWatch && (
							<>
								<Separator className="my-2" />
								<PaymentForm />
							</>
						)}
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
								<MoreOptionsForm />
							</CollapsibleContent>
						</Collapsible>
					</div>
				</ScrollArea>
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
							!isSuccessAssignments ||
							tagsWatch === null ||
							subTagsWatch === null
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
