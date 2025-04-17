import { type Choices, EditManyChoice } from "@/components/edit-many-choice";
import { DatePicker } from "@/components/extends-ui/date-picker";
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
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useSearch } from "@/contexts/search";
import { getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import { getTransactionsWithInfiniteScroll } from "@/http/transactions/_utils/get-transactions-with-infinite-scroll";
import { accountsKeys } from "@/queries/keys/accounts";
import { banksKeys } from "@/queries/keys/banks";
import { transactionsKeys } from "@/queries/keys/transactions";
import type { ITransactionsForm } from "@/schemas/transactions";
import { FREQUENCY } from "@/types/enums/frequency";
import { INTERVAL } from "@/types/enums/interval";
import { getFavicon } from "@/utils/get-favicon";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";

interface PaymentConditionsFormProps {
	type?: "edit" | "add";
	editType?: "default" | "many";
	id: string;
	choices?: Choices | null;
	setChoices?: Dispatch<SetStateAction<Choices>>;
}

export const PaymentConditionsForm = ({
	type,
	editType,
	id,
	choices,
	setChoices,
}: PaymentConditionsFormProps) => {
	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();

	const { data: transactionsWithPagination } =
		type === "edit"
			? useInfiniteQuery({
					queryKey: transactionsKeys.filter({
						month,
						year,
						from,
						to,
						dateConfig,
						dateType,
						search,
					}),
					queryFn: async ({ pageParam }) =>
						getTransactionsWithInfiniteScroll({
							offset: pageParam,
							month,
							year,
							from,
							to,
							dateConfig,
							dateType,
							search,
						}),
					initialPageParam: 0,
					getPreviousPageParam: firstPage => firstPage?.previousPage,
					getNextPageParam: lastPage => lastPage?.nextPage,
				})
			: { data: undefined };

	const transactions = transactionsWithPagination?.pages?.flatMap(
		page => page.data
	);

	const FIRST_ID = 0;
	const [transactionId, transactionCurrentCount] =
		type === "edit"
			? editType === "many"
				? id.split(",")[FIRST_ID].split("-")
				: id.split("-")
			: [];
	const transaction =
		transactions?.find(
			transaction =>
				transaction.id === transactionId &&
				(transactionCurrentCount
					? transaction.repeatSettings?.currentCount ===
						Number(transactionCurrentCount)
					: true)
		) || null;

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

	const form = useFormContext<ITransactionsForm>();

	const frequencyWatch = form.watch("frequency");
	const repeatSettingsIntervalWatch = form.watch("repeatSettings.interval");

	const [isRepeatSettingsOpen, setIsRepeatSettingsOpen] = useState(
		frequencyWatch !== FREQUENCY.DO_NOT_REPEAT
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
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="dueDate"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={choices?.find(item => item.id === "dueDate")?.choice}
								>
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
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="accountId"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={
										choices?.find(item => item.id === "accountId")?.choice
									}
								>
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
										<SelectTrigger
											choice={
												choices?.find(item => item.id === "accountId")?.choice
											}
										>
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
					<div className="flex w-full items-start gap-2">
						<FormField
							control={form.control}
							name="frequency"
							render={({ field }) => (
								<FormItem className="w-1/2">
									<FormLabel>Frequência</FormLabel>
									{type === "edit" && editType === "many" && (
										<EditManyChoice
											id="frequency"
											choices={choices}
											setChoices={setChoices}
											disabled
										/>
									)}
									<FormControl
										choice={
											choices?.find(item => item.id === "frequency")?.choice
										}
									>
										<Select
											value={field.value}
											onValueChange={value => {
												if (value !== FREQUENCY.DO_NOT_REPEAT) {
													form.setValue(
														"repeatSettings.initialInstallment",
														type === "add"
															? 1
															: (transaction?.repeatSettings
																	?.initialInstallment ?? 1)
													);
													form.setValue(
														"repeatSettings.count",
														type === "add"
															? 2
															: (transaction?.repeatSettings?.count ?? 2)
													);
													form.setValue(
														"repeatSettings.interval",
														type === "add"
															? INTERVAL.MONTHLY
															: (transaction?.repeatSettings?.interval ??
																	INTERVAL.MONTHLY)
													);

													setIsRepeatSettingsOpen(true);
												}

												if (value === FREQUENCY.DO_NOT_REPEAT) {
													form.setValue("repeatSettings", null);

													setIsRepeatSettingsOpen(false);
												}

												field.onChange(value);
											}}
											disabled={type === "edit"}
										>
											<SelectTrigger
												choice={
													choices?.find(item => item.id === "frequency")?.choice
												}
											>
												<SelectValue placeholder="Selecione a frequência" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													{Object.values(FREQUENCY).map(frequency => (
														<SelectItem
															key={frequency}
															value={frequency}
															className="hover:bg-muted"
														>
															{frequency === FREQUENCY.DO_NOT_REPEAT &&
																"Pagamento único"}
															{frequency === FREQUENCY.REPEAT && "Parcelar"}
															{frequency === FREQUENCY.RECURRING && "Fixa"}
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
						{isRepeatSettingsOpen && editType !== "many" && (
							<div className="flex w-1/2 gap-2">
								{frequencyWatch === FREQUENCY.REPEAT && (
									<FormField
										control={form.control}
										name="repeatSettings.count"
										render={({ field }) => (
											<FormItem className="w-full">
												<FormControl>
													<div className="flex flex-col items-center justify-between gap-3">
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
								)}
								<FormField
									control={form.control}
									name="repeatSettings.interval"
									render={({ field }) => (
										<FormItem className="w-full">
											<FormControl>
												<div className="flex flex-col items-center justify-between gap-3">
													<span className="w-full text-muted-foreground text-sm">
														Periodicidade
													</span>
													<div className="w-full">
														<Select
															value={field.value}
															onValueChange={value => {
																if (value === INTERVAL.CUSTOM) {
																	form.setValue(
																		"repeatSettings.customDay",
																		null
																	);
																}

																if (value !== INTERVAL.CUSTOM) {
																	form.setValue(
																		"repeatSettings.customDay",
																		undefined
																	);
																}

																field.onChange(value);
															}}
														>
															<SelectTrigger>
																<SelectValue placeholder="Selecione a frequência" />
															</SelectTrigger>
															<SelectContent>
																<SelectGroup>
																	{Object.values(INTERVAL)
																		.filter(interval => {
																			if (
																				frequencyWatch === FREQUENCY.RECURRING
																			) {
																				return interval === INTERVAL.MONTHLY;
																			}

																			return true;
																		})
																		.map(interval => (
																			<SelectItem
																				key={interval}
																				value={interval}
																				className="hover:bg-muted"
																			>
																				{interval === INTERVAL.DAILY &&
																					frequencyWatch === FREQUENCY.REPEAT &&
																					"Diário"}
																				{interval === INTERVAL.WEEKLY &&
																					frequencyWatch === FREQUENCY.REPEAT &&
																					"Semanal"}
																				{interval === INTERVAL.MONTHLY &&
																					"Mensal"}
																				{interval === INTERVAL.QUARTERLY &&
																					frequencyWatch === FREQUENCY.REPEAT &&
																					"Trimestral"}
																				{interval === INTERVAL.YEARLY &&
																					frequencyWatch === FREQUENCY.REPEAT &&
																					"Anual"}
																				{interval === INTERVAL.CUSTOM &&
																					frequencyWatch === FREQUENCY.REPEAT &&
																					"Personalizado"}
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
								{repeatSettingsIntervalWatch === INTERVAL.CUSTOM && (
									<FormField
										control={form.control}
										name="repeatSettings.customDay"
										render={({ field }) => (
											<FormItem className="w-full">
												<FormControl>
													<div className="flex flex-col items-center justify-between gap-3">
														<span className="w-full text-muted-foreground text-sm">
															Por dia
														</span>
														<div className="w-full">
															<NumericFormat
																thousandSeparator="."
																decimalSeparator=","
																fixedDecimalScale={true}
																decimalScale={0}
																value={field.value}
																onValueChange={values => {
																	const numericValue =
																		values.floatValue ?? null;

																	field.onChange(numericValue);
																}}
																allowNegative={false}
																placeholder="Digite os dias"
																customInput={Input}
															/>
														</div>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
