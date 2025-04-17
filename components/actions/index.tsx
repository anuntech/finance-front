"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CONFIGS } from "@/configs";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useSearch } from "@/contexts/search";
import { getTransactionsWithInfiniteScroll } from "@/http/transactions/_utils/get-transactions-with-infinite-scroll";
import { transactionsKeys } from "@/queries/keys/transactions";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { DialogProps, IFormData } from "@/types/form-data";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, EllipsisVerticalIcon, Pencil, Trash2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
	PaymentConfirmDialog,
	type PaymentConfirmDialogType,
} from "../payment-confirm-dialog";
import { DeleteDialog, type HandleDelete } from "./delete-dialog";

interface Props {
	handleDelete: HandleDelete;
	details?: {
		title: string;
		description: string;
	};
	FormData?: IFormData;
	editDialogProps?: DialogProps;
	id?: string;
	transactionType?: TRANSACTION_TYPE;
}

export const Actions = ({
	handleDelete,
	details,
	FormData,
	editDialogProps,
	id,
	transactionType,
}: Props) => {
	const pathname = usePathname();

	const { components, functions } = CONFIGS.CONFIGURATION_ROUTES.find(
		route => route.path === pathname
	);

	if (!components) {
		throw new Error("Components not found!");
	}

	const { EditComponent } = components;

	if (!EditComponent) {
		throw new Error("EditComponent not found!");
	}

	const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
	const [editComponentIsOpen, setEditComponentIsOpen] = useState(false);
	const [paymentConfirmDialogIsOpen, setPaymentConfirmDialogIsOpen] =
		useState(false);
	const [paymentConfirmDialogType, setPaymentConfirmDialogType] =
		useState<PaymentConfirmDialogType | null>(null);

	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();

	const { data: transactionsWithPagination } = useInfiniteQuery({
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
		getPreviousPageParam: firstPage => firstPage.previousPage,
		getNextPageParam: lastPage => lastPage.nextPage,
	});

	const transactions = transactionsWithPagination?.pages?.flatMap(
		page => page.data
	);

	const [transactionId, transactionCurrentCount] = id.split("-");
	const transaction = transactions?.find(
		transaction =>
			transaction.id === transactionId &&
			(transactionCurrentCount
				? transaction.repeatSettings?.currentCount ===
					Number(transactionCurrentCount)
				: true)
	);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Opções">
						<EllipsisVerticalIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Opções</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{details && FormData && (
						<>
							{functions.payment && (
								<>
									<DropdownMenuItem>
										<button
											type="button"
											className="flex w-full items-center justify-start gap-2"
											onClick={() => {
												setPaymentConfirmDialogType("pay-actions");
												setPaymentConfirmDialogIsOpen(true);
											}}
										>
											<Check />
											{transaction?.type === TRANSACTION_TYPE.EXPENSE
												? "Pagar"
												: "Receber"}
										</button>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<button
											type="button"
											className="flex w-full items-center justify-start gap-2 [&:disabled]:line-through [&:disabled]:opacity-50"
											onClick={() => {
												setPaymentConfirmDialogType("not-pay-actions");
												setPaymentConfirmDialogIsOpen(true);
											}}
											disabled={!transaction?.isConfirmed}
										>
											<X />
											{transaction?.type === TRANSACTION_TYPE.EXPENSE
												? "Não paga"
												: "Não recebida"}
										</button>
									</DropdownMenuItem>
								</>
							)}
							<DropdownMenuItem>
								<button
									type="button"
									className="flex w-full items-center justify-start gap-2"
									onClick={() => setEditComponentIsOpen(true)}
								>
									<Pencil />
									Editar
								</button>
							</DropdownMenuItem>
						</>
					)}
					<DropdownMenuItem>
						<button
							type="button"
							className="flex w-full items-center justify-start gap-2 text-red-500"
							onClick={() => setDeleteDialogIsOpen(true)}
						>
							<Trash2 />
							Excluir
						</button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			{details && FormData && (
				<>
					<EditComponent
						editDialogIsOpen={editComponentIsOpen}
						setEditDialogIsOpen={setEditComponentIsOpen}
						details={details}
						FormData={FormData}
						dialogProps={editDialogProps}
						id={id}
						transactionType={transactionType}
					/>
					<PaymentConfirmDialog
						isPaymentConfirmDialogOpen={paymentConfirmDialogIsOpen}
						setIsPaymentConfirmDialogOpen={setPaymentConfirmDialogIsOpen}
						id={id}
						type={paymentConfirmDialogType}
					/>
				</>
			)}
			<DeleteDialog
				deleteDialogIsOpen={deleteDialogIsOpen}
				setDeleteDialogIsOpen={setDeleteDialogIsOpen}
				handleDelete={handleDelete}
				id={id}
			/>
		</>
	);
};
