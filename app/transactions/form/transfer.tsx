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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useSearch } from "@/contexts/search";
import { getAccounts } from "@/http/accounts/get";
import { transferAccount } from "@/http/accounts/transfer/post";
import { getBanks } from "@/http/banks/get";
import type { Transaction } from "@/http/transactions/get";
import { cn } from "@/lib/utils";
import { accountsKeys } from "@/queries/keys/accounts";
import { banksKeys } from "@/queries/keys/banks";
import { transactionsKeys } from "@/queries/keys/transactions";
import { transferSchema } from "@/schemas/transfer";
import type { ITransferForm as ITransferFormSchema } from "@/schemas/transfer";
import type { ITransferForm } from "@/types/form-data";
import { getFavicon } from "@/utils/get-favicon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { NumericFormat } from "react-number-format";

export const TransferForm: ITransferForm = ({ setComponentIsOpen }) => {
	const queryClient = useQueryClient();

	const { date, month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();
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
		queryFn: () => getAccounts({ month, year, from, to, dateConfig, dateType }),
	});

	const {
		data: banks,
		isLoading: isLoadingBanks,
		isSuccess: isSuccessBanks,
	} = useQuery({
		queryKey: banksKeys.all,
		queryFn: getBanks,
	});

	const form = useForm<ITransferFormSchema>({
		resolver: zodResolver(transferSchema),
		defaultValues: {
			accountIdFrom: "",
			accountIdTo: "",
			amount: 0,
		},
	});

	const transferTransactionMutation = useMutation({
		mutationFn: (data: ITransferFormSchema) => {
			return transferAccount({
				sourceAccountId: data.accountIdFrom,
				destinationAccountId: data.accountIdTo,
				amount: data.amount,
			});
		},
		onSuccess: () => {
			// temporary disabled
			// queryClient.setQueryData(
			// 	transactionsKeys.filter({
			// 		month,
			// 		year,
			// 		from,
			// 		to,
			// 		dateConfig,
			// 		dateType,
			// 		search,
			// 	}),
			// 	(transactions: Array<Transaction>) => {
			// 		const newTransactions = [...transactions];

			// 		return newTransactions;
			// 	}
			// );
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

			toast.success("Transferência realizada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao realizar transferência: ${message}`);
		},
	});

	const onSubmit = (data: ITransferFormSchema) => {
		transferTransactionMutation.mutate(data);
	};

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

	const accountFrom = form.watch("accountIdFrom");
	const accountTo = form.watch("accountIdTo");

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col gap-4 p-2">
					<FormField
						control={form.control}
						name="accountIdFrom"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Conta de origem</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
										disabled={isLoadingAccounts}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione uma conta" />
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
															disabled={
																account.id === accountFrom ||
																account.id === accountTo
															}
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
						name="accountIdTo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Conta de destino</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
										disabled={isLoadingAccounts}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione uma conta" />
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
															disabled={
																account.id === accountFrom ||
																account.id === accountTo
															}
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
						name="amount"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Valor</FormLabel>
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
										placeholder="Valor da transação"
										customInput={Input}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className={cn("flex w-full items-center justify-end gap-2")}>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							type="button"
							onClick={() => {
								setComponentIsOpen(false);
							}}
							className="w-full max-w-24"
							disabled={
								transferTransactionMutation.isPending ||
								transferTransactionMutation.isSuccess
							}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={
								transferTransactionMutation.isPending ||
								transferTransactionMutation.isSuccess ||
								isLoadingAccounts ||
								!isSuccessAccounts ||
								isLoadingBanks ||
								!isSuccessBanks
							}
							className={cn(
								"w-full max-w-24",
								transferTransactionMutation.isPending ? "max-w-32" : ""
							)}
						>
							{transferTransactionMutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Salvando...
								</>
							) : (
								"Salvar"
							)}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
