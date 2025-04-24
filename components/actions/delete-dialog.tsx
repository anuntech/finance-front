"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FREQUENCY } from "@/types/enums/frequency";
import type { UseMutationResult } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type HandleDelete = UseMutationResult<any, Error, string, unknown>;
interface DeleteDialogProps {
	deleteDialogIsOpen: boolean;
	setDeleteDialogIsOpen: Dispatch<SetStateAction<boolean>>;
	handleDelete: HandleDelete;
	id: string;
	transactionFrequency?: FREQUENCY;
}

export const DeleteDialog = ({
	deleteDialogIsOpen,
	setDeleteDialogIsOpen,
	handleDelete,
	id,
	transactionFrequency,
}: DeleteDialogProps) => {
	const [deleteType, setDeleteType] = useState<"single" | "all">("single");

	const onSubmit = (id: string) => {
		handleDelete.mutate(id, {
			onSuccess: () => {
				handleDelete.reset();

				setDeleteDialogIsOpen(false);
			},
		});
	};

	return (
		<Dialog
			open={deleteDialogIsOpen}
			onOpenChange={isOpen => {
				if (!isOpen) {
					setDeleteDialogIsOpen(false);
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Você tem certeza?</DialogTitle>
					<DialogDescription>
						Esta ação não pode ser desfeita. Isso excluirá permanentemente o seu
						dado.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setDeleteDialogIsOpen(false)}
						disabled={handleDelete.isPending || handleDelete.isSuccess}
						className="w-full max-w-24"
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						variant="destructive"
						disabled={handleDelete.isPending || handleDelete.isSuccess}
						onClick={() => {
							setDeleteType("single");
							onSubmit(id);
						}}
						className={cn(
							"w-full max-w-24",
							transactionFrequency === FREQUENCY.REPEAT && "max-w-56",
							(handleDelete.isPending || handleDelete.isSuccess) &&
								deleteType === "single"
								? "max-w-32"
								: ""
						)}
					>
						{handleDelete.isPending && deleteType === "single" ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Excluindo...
							</>
						) : transactionFrequency === FREQUENCY.REPEAT ? (
							"Excluir apenas selecionado"
						) : (
							"Excluir"
						)}
					</Button>
					{transactionFrequency === FREQUENCY.REPEAT && (
						<Button
							type="submit"
							variant="destructive"
							disabled={handleDelete.isPending || handleDelete.isSuccess}
							onClick={() => {
								setDeleteType("all");
								onSubmit(id.split("-")?.[0]);
							}}
							className={cn(
								"w-full max-w-24",
								transactionFrequency === FREQUENCY.REPEAT && "max-w-32",
								(handleDelete.isPending || handleDelete.isSuccess) &&
									deleteType === "all"
									? "max-w-32"
									: ""
							)}
						>
							{handleDelete.isPending && deleteType === "all" ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Excluindo...
								</>
							) : (
								"Excluir todos"
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
