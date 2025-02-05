import type { JSX } from "react";

interface FormDataProps {
	type: "add" | "edit";
	setOpenDialog: (open: boolean) => void;
	id?: string;
}

export type IFormData = (props: FormDataProps) => JSX.Element;
