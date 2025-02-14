import { Skeleton } from "./ui/skeleton";

export const SkeletonTable = () => {
	return (
		<div className="flex min-h-[calc(100vh-6.5rem)] flex-col justify-between gap-2">
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Skeleton className="h-10 w-64" />
						<Skeleton className="h-10 w-14" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-10 w-28" />
						<Skeleton className="h-10 w-14" />
						<Skeleton className="h-10 w-14" />
					</div>
				</div>
				<Skeleton className="h-56 w-full" />
			</div>
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-32" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-40" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-8 w-20" />
				</div>
			</div>
		</div>
	);
};
