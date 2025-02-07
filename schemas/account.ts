import { z } from "zod";

export const accountSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Nome é obrigatório" })
		.regex(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9-_()\s]+$/, {
			message: "Nome não pode conter caracteres especiais",
		}),
	balance: z.number({ message: "Saldo inicial é obrigatório" }).min(1, {
		message: "Saldo inicial é obrigatório",
	}),
	bank: z.string().min(1, { message: "Banco é obrigatório" }),
});

export type IAccountForm = z.infer<typeof accountSchema>;
