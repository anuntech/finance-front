import { z } from "zod";

export const accountSchema = z.object({
	name: z.string().min(1, { message: "Nome é obrigatório" }),
	balance: z.number().min(0, { message: "Saldo inicial é obrigatório" }),
});

export type IAccountForm = z.infer<typeof accountSchema>;
