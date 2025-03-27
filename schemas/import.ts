import { z } from "zod";

export const importSchema = z.object({
	import: z.instanceof(Object).superRefine((data, ctx) => {
		const files = data as FileList;

		if (files.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Selecione um arquivo CSV.",
				path: ["import"],
			});

			return;
		}

		const [file] = files;

		if (
			file.type !== "text/csv" &&
			file.type !==
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Arquivo inválido, selecione um arquivo CSV ou Excel.",
				path: ["import"],
			});

			return;
		}

		return true;
	}),
});

export type ImportForm = z.infer<typeof importSchema>;
