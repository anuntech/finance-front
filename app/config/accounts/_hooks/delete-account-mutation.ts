import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { deleteAccount } from "@/http/accounts/delete";
import type { Account } from "@/http/accounts/get";
import { accountsKeys } from "@/queries/keys/accounts";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteAccountMutation = () => {
	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();

	const queryClient = useQueryClient();

	const deleteAccountMutation = useMutation({
		mutationFn: (id: string) => deleteAccount({ id }),
		onSuccess: (_, id: string) => {
			const ids = id.split(",");

			queryClient.setQueryData(
				accountsKeys.filter({ month, year, from, to, dateConfig, dateType }),
				(accounts: Array<Account>) => {
					const newAccounts = accounts?.filter(
						account => !ids.includes(account.id)
					);

					return newAccounts;
				}
			);
			queryClient.invalidateQueries({
				queryKey: accountsKeys.filter({
					month,
					year,
					from,
					to,
					dateConfig,
					dateType,
				}),
			});

			toast.success("Conta(s) deletada(s) com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar conta(s): ${message}`);
		},
	});

	return deleteAccountMutation;
};
