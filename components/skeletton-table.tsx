import { Separator } from "@radix-ui/react-dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export const SkeletonTable = () => {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-start justify-between gap-4">
				<Skeleton className="h-10 w-96" />
				<Skeleton className="h-10 w-20" />
			</div>
			<div className="flex flex-col items-center">
				<Skeleton className="h-14 w-full" />
				<Separator />
				<Skeleton className="h-14 w-full" />
				<Separator />
				<Skeleton className="h-14 w-full" />
				<Separator />
				<Skeleton className="h-14 w-full" />
			</div>
			<div className="flex justify-end gap-2">
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-8 w-14" />
			</div>
		</div>
	);
};
