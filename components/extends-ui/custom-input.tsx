import type { ComponentProps, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
	SelectContentProps,
	SelectProps,
	SelectTriggerProps,
	SelectValueProps,
} from "@radix-ui/react-select";

interface InputRootProps extends ComponentProps<"div"> {}

const InputRoot = ({ className, ...props }: InputRootProps) => {
	return (
		<div
			className={cn(
				"flex h-10 w-full rounded-md border border-input bg-background text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
				className
			)}
			{...props}
		/>
	);
};

interface CustomInputProps extends ComponentProps<"input"> {}

const CustomInput = ({ className, ...props }: CustomInputProps) => {
	return (
		<Input
			{...props}
			className={cn(
				className,
				"border-none bg-transparent outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
			)}
		/>
	);
};

interface CustomSelectProps {
	classNames: {
		select: SelectProps;
		selectTrigger?: SelectTriggerProps;
		selectValue: SelectValueProps;
		selectContent?: SelectContentProps;
	};
	children: ReactNode;
}

const CustomSelect = ({ classNames, children }: CustomSelectProps) => {
	const { select, selectTrigger, selectValue, selectContent } = classNames;

	return (
		<Select {...select}>
			<SelectTrigger
				{...selectTrigger}
				className={cn(
					selectTrigger?.className,
					"h-[2.4rem] rounded-none rounded-r-md border-t-0 border-r-0 border-b-0 border-l-1 bg-transparent outline-none"
				)}
				isWithIcon={false}
			>
				<SelectValue {...selectValue} />
			</SelectTrigger>
			<SelectContent {...selectContent}>{children}</SelectContent>
		</Select>
	);
};

export { InputRoot, CustomInput, CustomSelect };
