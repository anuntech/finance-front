"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { DialogProps, IFormData } from "@/types/form-data";

export interface EditDialogProps {
	editDialogIsOpen: boolean;
	setEditDialogIsOpen: (isOpen: boolean) => void;
	details: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	dialogProps?: DialogProps;
	id?: string;
	transactionType?: TRANSACTION_TYPE;
}

export const EditDialog = ({
	editDialogIsOpen,
	setEditDialogIsOpen,
	details,
	FormData,
	dialogProps,
	id,
	transactionType,
}: EditDialogProps) => {
	return (
		<Dialog
			open={editDialogIsOpen}
			onOpenChange={isOpen => {
				if (!isOpen) {
					setEditDialogIsOpen(false);
				}
			}}
		>
			<DialogContent {...dialogProps?.dialogContent}>
				<DialogHeader>
					<DialogTitle>{details.title}</DialogTitle>
					<DialogDescription>{details.description}</DialogDescription>
				</DialogHeader>
				<FormData
					type="edit"
					setComponentIsOpen={setEditDialogIsOpen}
					id={id}
					transactionType={transactionType}
				/>
			</DialogContent>
		</Dialog>
	);
};
