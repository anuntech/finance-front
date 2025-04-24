import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useSearch } from "@/contexts/search";
import { deleteTransaction } from "@/http/transactions/delete";
import { transactionsKeys } from "@/queries/keys/transactions";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteTransactionMutation = () => {
	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();

	const queryClient = useQueryClient();

	const deleteTransactionMutation = useMutation({
		mutationFn: (id: string) => deleteTransaction({ id }),
		onSuccess: (_, id: string) => {
			// temporary disable because infinite scroll caused a break change on manipulation of cache
			// const ids = id.split(",");

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
			// 		const newTransactions = transactions?.filter(
			// 			transaction => !ids.includes(transaction.id)
			// 		);

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

			toast.success("Transação(ões) deletada(s) com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar transação(ões): ${message}`);
		},
	});

	return deleteTransactionMutation;
};
