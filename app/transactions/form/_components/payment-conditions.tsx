import { Counter } from "@/components/counter";
import { DatePicker } from "@/components/date-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
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
import { Switch } from "@/components/ui/switch";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import type { ITransactionsForm } from "@/schemas/transactions";
import { FREQUENCY, FREQUENCY_VALUES } from "@/types/enums/frequency";
import { INTERVAL, INTERVAL_VALUES } from "@/types/enums/interval";
import { getFavicon } from "@/utils/get-favicon";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

export const PaymentConditionsForm = () => {
	const { date } = useDateWithMonthAndYear();

	const { month, year } = date;

	const {
		data: accounts,
		isLoading: isLoadingAccounts,
		isSuccess: isSuccessAccounts,
	} = useQuery({
		queryKey: ["get-accounts"],
		queryFn: () => getAccounts({ month, year }),
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

	const frequency = form.getValues("frequency");

	const [isRepeatSettingsOpen, setIsRepeatSettingsOpen] = useState(
		frequency === FREQUENCY.REPEAT
	);

	return (
		<section className="flex flex-col gap-2">
			<header>
				<h2 className="font-semibold text-md">Condições de pagamento</h2>
			</header>
			<div className="flex flex-col gap-4">
				<div className="flex w-full gap-2">
					<FormField
						control={form.control}
						name="dueDate"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Data de vencimento</FormLabel>
								<FormControl>
									<DatePicker date={field.value} setDate={field.onChange} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
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
				<div className="flex w-full gap-2">
					<div className="flex w-full items-end gap-2">
						<FormField
							control={form.control}
							name="frequency"
							render={({ field }) => (
								<FormItem className="w-1/2">
									<FormLabel>Frequência</FormLabel>
									<FormControl>
										<Select
											value={field.value}
											onValueChange={value => {
												if (value === FREQUENCY.REPEAT) {
													form.setValue("repeatSettings.initialInstallment", 1);
													form.setValue("repeatSettings.count", 2);
													form.setValue(
														"repeatSettings.interval",
														INTERVAL.MONTHLY
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
							<div className="flex w-1/2 gap-2">
								<FormField
									control={form.control}
									name="repeatSettings.count"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormControl>
												<div className="flex flex-col items-center justify-between gap-2">
													<span className="w-full text-muted-foreground text-sm">
														Parcelas
													</span>
													<div className="w-full">
														<Select
															value={field.value?.toString()}
															onValueChange={value => {
																field.onChange(Number(value));
															}}
														>
															<SelectTrigger>
																<SelectValue placeholder="Selecione a frequência" />
															</SelectTrigger>
															<SelectContent>
																<SelectGroup>
																	{Array.from({ length: 367 }, (_, i) => {
																		const num = i + 1;
																		return (
																			<SelectItem
																				key={num}
																				value={num?.toString()}
																				className="hover:bg-muted"
																			>
																				{num}
																			</SelectItem>
																		);
																	})}
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
								<FormField
									control={form.control}
									name="repeatSettings.interval"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormControl>
												<div className="flex flex-col items-center justify-between gap-2">
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
																			{interval === INTERVAL.MONTHLY &&
																				"Mensal"}
																			{/* {interval === INTERVAL.DAILY && "Diário"} */}
																			{/* {interval === INTERVAL.WEEKLY && "Semanal"} */}
																			{interval === INTERVAL.QUARTERLY &&
																				"Trimestral"}
																			{interval === INTERVAL.YEARLY && "Anual"}
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
					{/* <FormField
						control={form.control}
						name="isConfirmed"
						render={({ field }) => (
							<FormItem className="flex w-full flex-col gap-2">
								<FormControl>
									<div className="flex h-[72px] w-full items-end justify-between">
										<div className="flex h-10 w-full items-center justify-end gap-4">
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
											<span className="text-muted-foreground text-sm">
												Pagamento realizado
											</span>
										</div>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/> */}
				</div>
			</div>
		</section>
	);
};
