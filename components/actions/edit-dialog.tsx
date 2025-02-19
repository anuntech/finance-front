"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { IFormData } from "@/types/form-data";

interface EditDialogProps {
	editDialogIsOpen: boolean;
	setEditDialogIsOpen: (isOpen: boolean) => void;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	id?: string;
}

export const EditDialog = ({
	editDialogIsOpen,
	setEditDialogIsOpen,
	dialog,
	FormData,
	id,
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{dialog.title}</DialogTitle>
					<DialogDescription>{dialog.description}</DialogDescription>
				</DialogHeader>
				<FormData type="edit" setOpenDialog={setEditDialogIsOpen} id={id} />
			</DialogContent>
		</Dialog>
	);
};
