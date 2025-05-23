import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Column } from "@tanstack/react-table";
import { ListFilterPlus, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type FilterProps = {
	isFilterOpen: boolean;
	setIsFilterOpen: Dispatch<SetStateAction<boolean>>;
	isLoading: boolean;
	columns: Column<unknown, unknown>[];
	filterIds: Array<string>;
	setFilterIds: Dispatch<SetStateAction<Array<string>>>;
	type: "row" | "select";
};

export const FilterSelect = ({
	isFilterOpen,
	setIsFilterOpen,
	isLoading,
	columns,
	filterIds,
	setFilterIds,
	type,
}: FilterProps) => {
	const columnsToFilter = columns.filter(
		column => column.columnDef?.meta?.filter && !filterIds.includes(column.id)
	);

	return (
		<Popover
			open={isFilterOpen}
			onOpenChange={open => {
				if (!open) setIsFilterOpen(false);
			}}
		>
			{type === "select" && (
				<PopoverTrigger asChild>
					<Button
						size="sm"
						variant="outline"
						className="ml-auto"
						title="Filtrar"
						onClick={() => setIsFilterOpen(true)}
						disabled={isLoading}
					>
						<ListFilterPlus />
					</Button>
				</PopoverTrigger>
			)}
			{type === "row" && (
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="2xs"
						onClick={() => setIsFilterOpen(true)}
						disabled={isLoading}
					>
						<Plus />
						Filtrar
					</Button>
				</PopoverTrigger>
			)}
			<PopoverContent className="w-full max-w-48 p-0">
				<Command>
					<CommandInput placeholder="Pesquisar coluna..." />
					<CommandList>
						<CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
						<CommandGroup>
							{columnsToFilter.map(column => (
								<CommandItem
									key={column.id}
									onSelect={() => setFilterIds(prev => [...prev, column.id])}
								>
									<div className="flex items-center gap-2">
										<Plus />
										<span>{column.columnDef?.meta?.headerName}</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
