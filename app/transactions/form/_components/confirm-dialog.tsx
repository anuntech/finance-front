import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ITransactionsForm } from "@/schemas/transactions";
import type { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";

interface ConfirmDialogProps {
	confirmDialogIsOpen: boolean;
	setConfirmDialogIsOpen: Dispatch<SetStateAction<boolean>>;
	onSubmit: (data: ITransactionsForm) => void;
}

export const ConfirmDialog = ({
	confirmDialogIsOpen,
	setConfirmDialogIsOpen,
	onSubmit,
}: ConfirmDialogProps) => {
	const form = useFormContext();

	return (
		<Dialog open={confirmDialogIsOpen} onOpenChange={setConfirmDialogIsOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Tem certeza que deseja realizar essa edição?
					</DialogTitle>
					<DialogDescription>
						A edição será aplicada apenas ao mês selecionado.
					</DialogDescription>
					<DialogFooter className="pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setConfirmDialogIsOpen(false);
							}}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="destructive"
							onClick={() => {
								form.handleSubmit(onSubmit)();

								setConfirmDialogIsOpen(false);
							}}
						>
							Confirmar
						</Button>
					</DialogFooter>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};
