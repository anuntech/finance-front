import type { AddMutation } from "@/components/data-table";
import type { JSX } from "react";
interface FormDataProps {
	type: "add" | "edit";
	setOpenDialog: (open: boolean) => void;
	id?: string;
	addMutation?: AddMutation;
}

export type IFormData = (props: FormDataProps) => JSX.Element;
