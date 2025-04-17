import { ClientComponent } from "./client";

export async function generateStaticParams() {
	return [
		{
			transaction: "recipes",
		},
		{
			transaction: "expenses",
		},
		{
			transaction: "tags",
		},
	];
}

type Params = Promise<{ transaction: "recipes" | "expenses" | "tags" }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface Props {
	params: Params;
	searchParams: SearchParams;
}

const AccountsConfigPage = async ({ params, searchParams }: Props) => {
	const { transaction } = await params;
	const { categoryId } = await searchParams;

	return (
		<ClientComponent
			transaction={transaction}
			categoryId={categoryId as string}
		/>
	);
};

export default AccountsConfigPage;
