import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { FormControl } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import { FormItem } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CSV from "@/public/csv.svg";
import Excel from "@/public/excel.svg";
import Idea from "@/public/idea.svg";
import type { ImportForm } from "@/schemas/import";
import { exportToCSV } from "@/utils/export/export-to-csv";
import { exportToExcel } from "@/utils/export/export-to-excel";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, Table } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSteps } from "../_contexts/steps";

interface CardFileProps {
	className?: string;
	image: string;
	alt: string;
	type: ".xlsx" | ".csv";
}

export const CardFile = ({ className, image, alt, type }: CardFileProps) => {
	const form = useFormContext<ImportForm>();

	const fileInput = form.watch("import");

	const textType =
		type === ".xlsx"
			? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			: "text/csv";

	return (
		<>
			<button
				type="button"
				className={cn(
					"flex h-36 w-48 flex-col items-center justify-center gap-4 rounded-lg border border-border bg-white p-4 shadow-md transition-all duration-300 hover:scale-105 hover:bg-muted hover:shadow-lg focus:scale-105 focus:bg-muted focus:shadow-lg",
					className,
					fileInput &&
						(fileInput as File[])[0]?.type === textType &&
						"scale-105 border-primary bg-muted shadow-lg"
				)}
				onClick={() => {
					form.setValue("import", null);

					const fileInput = document.getElementById(
						"file-input-import"
					) as HTMLInputElement;

					fileInput.setAttribute("accept", textType);

					fileInput.click();
				}}
			>
				<Image src={image} width={72} height={72} alt={alt} />
				<span className="font-medium text-sm">{alt}</span>
			</button>
		</>
	);
};

interface StepUploadProps<TData> {
	table: Table<TData>;
	columns: ColumnDef<TData>[];
}

export const StepUpload = <TData,>({
	table,
	columns,
}: StepUploadProps<TData>) => {
	const pathname = usePathname();

	const queryClient = useQueryClient();

	const { transactionType } = useSteps();

	const form = useFormContext<ImportForm>();

	return (
		<div className="flex h-full w-full flex-col items-center justify-between gap-4">
			<header className="my-4 w-full rounded-md bg-muted">
				<div className="flex h-full w-full items-center justify-center gap-4 px-4 py-8">
					<CardFile image={Excel} alt="Arquivo do Excel" type=".xlsx" />
					<CardFile image={CSV} alt="Arquivo CSV" type=".csv" />
					<FormField
						control={form.control}
						name="import"
						render={() => (
							<FormItem className="hidden w-full">
								<FormLabel>Arquivo para importação</FormLabel>
								<FormControl>
									<Input
										id={"file-input-import"}
										type="file"
										placeholder="Arquivo para importação"
										{...form.register("import")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</header>
			<div className="flex h-full w-full items-center justify-center gap-4">
				<aside>
					<Image src={Idea} width={64} height={64} alt="Lâmpada" />
				</aside>
				<div className="flex flex-col gap-4">
					<div>
						<h3 className="font-medium text-sm">Baixe uma planilha modelo</h3>
						<p className="text-justify text-sm">
							Faça o download e use o nosso arquivo de amostra para ver
							exatamente como organizamos os dados de importação.
						</p>
					</div>
					<ul className="flex flex-col gap-1 text-primary">
						<li>
							<Button
								variant="link"
								asChild
								className="h-fit p-0"
								onClick={() =>
									exportToExcel({
										table,
										pathname,
										queryClient,
										columns,
										type: "empty",
										transactionType,
									})
								}
							>
								<Link href="#">Baixar uma planilha modelo de Excel</Link>
							</Button>
						</li>
						<li>
							<Button
								variant="link"
								asChild
								className="h-fit p-0"
								onClick={() =>
									exportToCSV({
										table: table,
										columns: columns,
										queryClient: queryClient,
										pathname: pathname,
										type: "empty",
										transactionType,
									})
								}
							>
								<Link href="#">Baixar uma planilha modelo em .csv</Link>
							</Button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};
