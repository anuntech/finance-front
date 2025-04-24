import { Actions } from "@/components/actions";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CustomField } from "@/http/custom-fields/get";
import { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { ColumnDef } from "@tanstack/react-table";
import { useDeleteCustomFieldMutation } from "./_hooks/delete-custom-field-mutation";
import { CustomFieldForm } from "./form";

const NotAvailable = () => (
	<span className="text-red-500 text-xs">Não disponível</span>
);

export const columns: Array<ColumnDef<CustomField>> = [
	{
		id: "select",
		enableSorting: false,
		enableHiding: false,
		size: 25,
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() ? "indeterminate" : false)
				}
				onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<div className="flex max-w-10 items-center justify-start">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={value => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
	},
	{
		accessorKey: "name",
		meta: {
			headerName: "Nome",
		},
		header: "Nome",
		cell: ({ row }) => {
			return (
				<div>
					<span>{row.getValue("name")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "type",
		meta: {
			headerName: "Tipo",
		},
		header: "Tipo",
		cell: ({ row }) => {
			const type = row.original.type;

			return (
				<div>
					{type === CUSTOM_FIELD_TYPE.TEXT && <span>Texto</span>}
					{type === CUSTOM_FIELD_TYPE.NUMBER && <span>Número</span>}
					{/* {type === CUSTOM_FIELD_TYPE.DATE && <span>Data</span>} */}
					{type === CUSTOM_FIELD_TYPE.SELECT && <span>Seleção</span>}
				</div>
			);
		},
	},
	{
		accessorKey: "options",
		meta: {
			headerName: "Opções",
		},
		header: "Opções",
		cell: ({ row }) => {
			const options = row.original.options;

			if (options === null || options?.length === 0) {
				return (
					<div>
						<NotAvailable />
						<span className="hidden">{row.getValue("options")}</span>
					</div>
				);
			}

			return (
				<div>
					<DropdownMenu>
						<DropdownMenuTrigger>Visualizar</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>Opções</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{options.map((option, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<DropdownMenuItem key={index}>{option}</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<span className="hidden">{row.getValue("options")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "transactionType",
		meta: {
			headerName: "Tipo de Transação",
		},
		header: "Tipo de Transação",
		cell: ({ row }) => {
			const transactionType = row.original.transactionType;

			return (
				<div>
					{transactionType === TRANSACTION_TYPE.ALL && <span>Todas</span>}
					{transactionType === TRANSACTION_TYPE.EXPENSE && <span>Despesa</span>}
					{transactionType === TRANSACTION_TYPE.RECIPE && <span>Receita</span>}
					<span className="hidden">{row.getValue("transactionType")}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "required",
		meta: {
			headerName: "Obrigatório",
		},
		header: "Obrigatório",
		cell: ({ row }) => {
			const required = row.original.required;

			return (
				<div>
					{required === true && <span>Sim</span>}
					{required === false && <span>Não</span>}
					<span className="hidden">{row.getValue("required")}</span>
				</div>
			);
		},
	},
	{
		id: "actions",
		enableHiding: false,
		enableSorting: false,
		minSize: 100,
		size: 100,
		cell: ({ row }) => {
			const deleteCustomFieldMutation = useDeleteCustomFieldMutation();

			return (
				<div className="flex justify-end">
					<Actions
						handleDelete={deleteCustomFieldMutation}
						details={{
							title: "Editar campo",
							description: "Edite o campo para atualizar suas informações",
						}}
						FormData={CustomFieldForm}
						id={row.original.id}
					/>
				</div>
			);
		},
		footer: ({ table }) => {
			const deleteCustomFieldMutation = useDeleteCustomFieldMutation();

			const ids = table
				.getFilteredSelectedRowModel()
				.rows.map(row => row.original.id);
			const idsString = ids.join(",");

			return (
				<div className="flex justify-end">
					{ids.length > 0 && (
						<Actions handleDelete={deleteCustomFieldMutation} id={idsString} />
					)}
				</div>
			);
		},
	},
];
