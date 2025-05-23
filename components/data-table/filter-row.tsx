import type { Column, Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { FilterSelect } from "./filter-select";

interface FilterRowProps {
	filterIds: Array<string>;
	setFilterIds: Dispatch<SetStateAction<Array<string>>>;
	columns: Column<unknown, unknown>[];
	table: Table<unknown>;
	isFilterRowOpen: boolean;
	setIsFilterRowOpen: Dispatch<SetStateAction<boolean>>;
}

export const FilterRow = ({
	filterIds,
	setFilterIds,
	columns,
	table,
	isFilterRowOpen,
	setIsFilterRowOpen,
}: FilterRowProps) => {
	const [openFilterId, setOpenFilterId] = useState<string | null>(null);

	const filterColumns = columns.filter(column => filterIds.includes(column.id));

	return (
		<ScrollArea className="w-full">
			<div className="flex items-center justify-start gap-2">
				{filterColumns.map(filterColumn => {
					const headerName = filterColumn.columnDef.meta.headerName;

					const isFilterOpen = openFilterId === headerName;
					const FilterComponent = filterColumn.columnDef.meta?.filter;

					return (
						<Popover
							key={filterColumn.id}
							open={isFilterOpen}
							onOpenChange={open => {
								if (!open) {
									setOpenFilterId(null);
								}
							}}
						>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="2xs"
									onClick={() => setOpenFilterId(headerName)}
								>
									{headerName}
									<ChevronDown className="size-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="p-0">
								<FilterComponent column={filterColumn} table={table} />
							</PopoverContent>
						</Popover>
					);
				})}
				<FilterSelect
					type="row"
					isFilterOpen={isFilterRowOpen}
					setIsFilterOpen={setIsFilterRowOpen}
					isLoading={false}
					columns={columns}
					filterIds={filterIds}
					setFilterIds={setFilterIds}
				/>
			</div>
			<ScrollBar orientation="horizontal" className="h-2" />
		</ScrollArea>
	);
};
