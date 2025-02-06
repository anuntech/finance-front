import { z } from "zod";

export const accountSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Nome é obrigatório" })
		.regex(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9-_()\s]+$/, {
			message: "Nome não pode conter caracteres especiais",
		}),
	balance: z.number().min(1, { message: "Saldo inicial é obrigatório" }),
	icon: z.object(
		{
			name: z.string().min(1, { message: "Nome é obrigatório" }),
			href: z.string().min(1, { message: "Href é obrigatório" }),
		},
		{
			message: "Selecione um banco",
		}
	),
});

export type IAccountForm = z.infer<typeof accountSchema>;
