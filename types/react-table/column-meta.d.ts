import "@tanstack/react-table"; //or vue, svelte, solid, qwik, etc.
import type { Dispatch, JSX, SetStateAction } from "react";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		headerName?: string;
		filter?: (props: {
			column: Column<TData, TValue>;
			table: Table<TData, TValue>;
		}) => JSX.Element;
	}
}
