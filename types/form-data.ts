import type { JSX } from "react";
interface FormDataProps {
	type: "add" | "edit";
	setComponentIsOpen: (open: boolean) => void;
	id?: string;
}

export type IFormData = (props: FormDataProps) => JSX.Element;
