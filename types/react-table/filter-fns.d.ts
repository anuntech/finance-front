import type { FilterFn } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
	interface FilterFns {
		arrIncludesSomeBoolean: FilterFn<unknown>;
	}
}
