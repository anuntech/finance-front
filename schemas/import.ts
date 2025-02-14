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

		if (file.type !== "text/csv") {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Arquivo inválido, selecione um arquivo CSV.",
				path: ["import"],
			});

			return;
		}

		return true;
	}),
});

export type ImportForm = z.infer<typeof importSchema>;
