import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
	title: string;
	step: number;
	isFilled?: boolean;
	className?: string;
}

export const StepIndicator = ({
	title,
	step,
	isFilled,
	className,
}: StepIndicatorProps) => {
	return (
		<div
			className={cn("flex w-full items-center justify-center gap-2", className)}
		>
			<Avatar className="h-6 w-6">
				<AvatarFallback
					className={cn(
						"bg-primary text-primary-foreground transition-all duration-300",
						!isFilled && "bg-muted text-muted-foreground"
					)}
				>
					{step}
				</AvatarFallback>
			</Avatar>
			<span className="text-nowrap font-medium text-sm">{title}</span>
		</div>
	);
};
