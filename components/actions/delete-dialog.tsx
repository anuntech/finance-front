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
import type { UseMutationResult } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type HandleDelete = UseMutationResult<any, Error, string, unknown>;

interface DeleteDialogProps {
	deleteDialogIsOpen: boolean;
	setDeleteDialogIsOpen: (isOpen: boolean) => void;
	handleDelete: HandleDelete;
	id: string;
}

export const DeleteDialog = ({
	deleteDialogIsOpen,
	setDeleteDialogIsOpen,
	handleDelete,
	id,
}: DeleteDialogProps) => {
	const pathname = usePathname();

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
						variant="destructive"
						disabled={handleDelete.isPending || handleDelete.isSuccess}
						onClick={() =>
							handleDelete.mutate(id, {
								onSuccess: () => {
									handleDelete.reset();

									setDeleteDialogIsOpen(false);
								},
							})
						}
						className={cn(
							"w-full max-w-24",
							handleDelete.isPending || handleDelete.isSuccess ? "max-w-32" : ""
						)}
					>
						{handleDelete.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Excluindo...
							</>
						) : (
							"Excluir"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
