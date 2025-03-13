import { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import { z } from "zod";

export const customFieldsSchema = z.object({
	name: z.string().min(1, { message: "Nome é obrigatório" }),
	type: z
		.nativeEnum(CUSTOM_FIELD_TYPE, {
			message: "Tipo é obrigatório",
		})
		.default(CUSTOM_FIELD_TYPE.TEXT),
	options: z
		.array(z.string().min(1, { message: "Opção é obrigatória" }))
		.optional(),
	required: z.boolean().optional().default(false),
});

export type ICustomFieldForm = z.infer<typeof customFieldsSchema>;
