import {
	EditDialog,
	type EditDialogProps,
} from "@/components/actions/edit-dialog";
import {
	AddDialog,
	type AddDialogProps,
} from "@/components/data-table/add-dialog";
import type { AddSheetProps } from "@/components/data-table/add-sheet";

interface ConfigurationRoute {
	path: string;
	functions: {
		export: boolean;
		import: boolean;
	};
	components: {
		AddComponent: React.ComponentType<AddDialogProps | AddSheetProps>;
		EditComponent: React.ComponentType<EditDialogProps>;
	};
}

export const CONFIGURATION_ROUTES: Array<ConfigurationRoute> = [
	{
		path: "/config/accounts",
		functions: {
			export: true,
			import: true,
		},
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/config/recipes",
		functions: {
			export: true,
			import: true,
		},
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/config/expenses",
		functions: {
			export: true,
			import: true,
		},
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/config/tags",
		functions: {
			export: true,
			import: true,
		},
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/transactions",
		functions: {
			export: false,
			import: false,
		},
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
];
