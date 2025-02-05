import { Skeleton } from "./ui/skeleton";

export const SkeletonTable = () => {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-4">
				<Skeleton className="h-10 w-96" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-32" />
				</div>
			</div>
			<Skeleton className="h-56 w-full" />
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-32" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-40" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-8 w-16" />
				</div>
			</div>
		</div>
	);
};
