import * as React from "react";

import { cn } from "@/lib/utils";

const InputContainer = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
	return (
		<div ref={ref} className={cn("relative w-full", className)} {...props} />
	);
});
InputContainer.displayName = "InputContainer";

const InputIcon = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
	({ className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"-translate-y-1/2 absolute top-1/2 left-3 scale-75 text-muted-foreground",
					className
				)}
				{...props}
			/>
		);
	}
);
InputIcon.displayName = "InputIcon";

type InputProps = React.ComponentProps<"input"> & {
	isWithIcon?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, isWithIcon = false, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					className,
					isWithIcon && "pl-10"
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Input.displayName = "Input";

export { Input, InputContainer, InputIcon };
