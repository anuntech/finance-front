import { CONFIGS } from "@/configs";
import { z } from "zod";

export const accountSchema = z.object({
	name: z
		.string()
		.min(3, { message: "Nome é obrigatório" })
		.max(30, { message: "Nome deve ter no máximo 30 caracteres" })
		.regex(CONFIGS.REGEX.name.regex, {
			message: CONFIGS.REGEX.name.message,
		}),
	balance: z.number({ message: "Saldo inicial é obrigatório" }),
	bankId: z.string().min(1, { message: "Banco é obrigatório" }),
});

export type IAccountForm = z.infer<typeof accountSchema>;
