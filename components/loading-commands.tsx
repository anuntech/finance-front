import { CommandItem } from "./ui/command";
import { Skeleton } from "./ui/skeleton";

export const LoadingCommands = () => {
	return (
		<div>
			<CommandItem>
				<Skeleton className="h-6 w-full rounded-full" />
			</CommandItem>
		</div>
	);
};
