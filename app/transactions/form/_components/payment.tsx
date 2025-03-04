import { DatePicker } from "@/components/date-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
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
import { getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import type { ITransactionsForm } from "@/schemas/transactions";
import { getFavicon } from "@/utils/get-favicon";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";

export const PaymentForm = () => {
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

	const form = useFormContext<ITransactionsForm>();

	return (
		<section className="flex flex-col gap-2">
			<header>
				<h2 className="font-semibold text-md">Informações de pagamento</h2>
			</header>
			<div className="flex flex-col gap-4">
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
										decimalScale={0}
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
										decimalScale={0}
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
				<div className="flex w-full gap-2">
					<div className="flex w-full gap-2">
						<FormField
							control={form.control}
							name="balance.liquidValue"
							render={({ field }) => {
								return (
									<FormItem className="w-full">
										<FormLabel>Valor pago</FormLabel>
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
						<FormField
							control={form.control}
							name="confirmationDate"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>Data de confirmação</FormLabel>
									<FormControl>
										<DatePicker date={field.value} setDate={field.onChange} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
			</div>
		</section>
	);
};
