import { EditDialog } from "@/components/actions/edit-dialog";
import { AddDialog } from "@/components/data-table/add-dialog";
import { AddSheet } from "@/components/data-table/add-sheet";
import { env } from "@/schemas/env";

export const CONFIGS = {
	REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE:
		env.NEXT_PUBLIC_REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE,
	DOMAIN_NAME: env.NEXT_PUBLIC_DOMAIN_NAME,
	SITE_URL: env.NEXT_PUBLIC_SITE_URL,
	API_URL: env.NEXT_PUBLIC_API_URL,
	WORKSPACE_API_URL: env.NEXT_PUBLIC_WORKSPACE_API_URL,
	HETZNER_S3_REGION: env.HETZNER_S3_REGION,
	HETZNER_S3_ENDPOINT: env.NEXT_PUBLIC_HETZNER_S3_ENDPOINT,
	HETZNER_S3_ACCESS_KEY_ID: env.HETZNER_S3_ACCESS_KEY_ID,
	HETZNER_S3_SECRET_ACCESS_KEY: env.HETZNER_S3_SECRET_ACCESS_KEY,
	HETZNER_S3_BUCKET_NAME: env.NEXT_PUBLIC_HETZNER_S3_BUCKET_NAME,
} as const;

export const CONFIGURATION_ROUTES = [
	{
		path: "/config/accounts",
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/config/recipes",
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/config/expenses",
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/config/tags",
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
	{
		path: "/transactions",
		components: {
			AddComponent: AddDialog,
			EditComponent: EditDialog,
		},
	},
] as const;

export const REGEX = {
	name: {
		regex: /^[A-Za-zÀ-ÖØ-öø-ÿ0-9-_\s]+$/,
		message: "Nome não pode conter caracteres especiais",
	},
} as const;
