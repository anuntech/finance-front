import type { DialogContentProps } from "@radix-ui/react-dialog";
import type { ForwardRefExoticComponent, JSX, RefAttributes } from "react";
import type { TRANSACTION_TYPE } from "./enums/transaction-type";

interface FormDataProps {
	type: "add" | "edit";
	setComponentIsOpen: (open: boolean) => void;
	id?: string;
	transactionType?: TRANSACTION_TYPE | null;
}

export type IFormData = (props: FormDataProps) => JSX.Element;
export interface DialogProps {
	dialogContent: DialogContentProps;
}
