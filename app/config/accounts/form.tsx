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
import { type Account, getAccounts } from "@/http/accounts/get";
import { getBanks } from "@/http/banks/get";
import type { IAccountForm } from "@/schemas/account";
import { accountSchema } from "@/schemas/account";
import type { IFormData } from "@/types/form-data";
import { getFavicon } from "@/utils/get-favicon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";

export const AccountForm: IFormData = ({ type, setOpenDialog, id }) => {
	const queryClient = useQueryClient();

	const { data: banks } = useQuery({
		queryKey: ["get-banks"],
		queryFn: getBanks,
	});

	const { data: accounts } = useQuery({
		queryKey: ["get-accounts"],
		queryFn: getAccounts,
	});

	const account = accounts?.find(account => account.id === id);

	const form = useForm<IAccountForm>({
		defaultValues: {
			name: type === "edit" ? account?.name : "",
			balance: type === "edit" ? account?.balance : null,
			bank: type === "edit" ? account?.icon.name : "",
		},
		resolver: zodResolver(accountSchema),
	});

	const addAccount = (data: IAccountForm) => {
		queryClient.setQueryData(["get-accounts"], (accounts: Array<Account>) => {
			const currentBank = banks?.find(bank => bank.name === data.bank);
			const newAccount: Account = {
				id: crypto.randomUUID(),
				name: data.name,
				balance: data.balance,
				icon: {
					name: currentBank.name,
					href: currentBank.href,
				},
			};
			const newAccounts = [newAccount, ...accounts];

			return newAccounts;
		});
	};

	const updateAccount = (data: IAccountForm) => {
		queryClient.setQueryData(["get-accounts"], (accounts: Array<Account>) => {
			const newAccount = accounts?.map(account => {
				if (account.id === id) {
					const currentBank = banks?.find(bank => bank.name === data.bank);
					const accountUpdated = {
						name: data.name,
						balance: data.balance,
						icon: {
							name: currentBank.name,
							href: currentBank.href,
						},
					};

					return accountUpdated;
				}

				return account;
			});

			return newAccount;
		});
	};

	const onSubmit = (data: IAccountForm) => {
		if (type === "add") {
			addAccount(data);
		}

		if (type === "edit") {
			updateAccount(data);
		}

		toast.success("Conta salva com sucesso");
		form.reset();

		setOpenDialog(false);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="flex w-full items-center gap-2">
					<FormField
						control={form.control}
						name="name"
						render={() => (
							<FormItem className="w-full">
								<FormLabel>Nome</FormLabel>
								<FormControl>
									<Input
										placeholder="Nome da conta"
										{...form.register("name")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="bank"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Banco</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione o banco" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{banks?.map(bank => (
													<SelectItem
														key={bank.id}
														value={bank.name}
														className="hover:bg-muted"
													>
														<div className="flex items-center gap-2 ">
															<Avatar className="h-4 w-4">
																<AvatarImage
																	src={getFavicon(bank.href)}
																	alt={bank.name}
																/>
																<AvatarFallback>{bank.name}</AvatarFallback>
															</Avatar>
															{bank.name}
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
				<FormField
					control={form.control}
					name="balance"
					render={({ field }) => (
						<FormItem className="w-1/2">
							<FormLabel>Saldo inicial</FormLabel>
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
									placeholder="Saldo inicial da conta"
									customInput={Input}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full max-w-24">
					Salvar
				</Button>
			</form>
		</Form>
	);
};
