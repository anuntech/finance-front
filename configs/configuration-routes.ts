import {
	EditDialog,
	type EditDialogProps,
} from "@/components/actions/edit-dialog";
import {
	AddDialog,
	type AddDialogProps,
} from "@/components/data-table/add-dialog";

interface ConfigurationRoute {
	path: string;
	functions: {
		export: boolean;
		import: boolean;
		payment: boolean;
	};
	components: {
		AddComponent: React.ComponentType<AddDialogProps>;
		EditComponent: React.ComponentType<EditDialogProps>;
	};
}

export const CONFIGURATION_ROUTES: Array<ConfigurationRoute> = [
	{
		path: "/config/accounts",
		functions: {
			export: true,
			import: true,
			payment: false,
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
			payment: false,
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
			payment: false,
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
			payment: false,
		},
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/config/custom-fields",
		functions: {
			export: false,
			import: false,
			payment: false,
		},
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/transactions",
		functions: {
			export: true,
			import: true,
			payment: true,
		},
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
];
