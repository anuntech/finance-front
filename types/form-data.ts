import type { DialogContentProps } from "@radix-ui/react-dialog";
import type { JSX } from "react";
import type { TRANSACTION_TYPE } from "./enums/transaction-type";

interface FormDataProps {
	type: "add" | "edit";
	editType?: "default" | "many";
	setComponentIsOpen: (open: boolean) => void;
	id?: string;
	transactionType?: TRANSACTION_TYPE | null;
}

export type IFormData = (props: FormDataProps) => JSX.Element;
export interface DialogProps {
	dialogContent: DialogContentProps;
}

export interface TransferFormProps {
	setComponentIsOpen: (open: boolean) => void;
}

export type ITransferForm = (props: TransferFormProps) => JSX.Element;
