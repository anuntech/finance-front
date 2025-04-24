import { deleteCustomField } from "@/http/custom-fields/delete";
import type { CustomField } from "@/http/custom-fields/get";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteCustomFieldMutation = () => {
	const queryClient = useQueryClient();

	const deleteCustomFieldMutation = useMutation({
		mutationFn: (id: string) => deleteCustomField({ id }),
		onSuccess: (_, id: string) => {
			const ids = id.split(",");

			queryClient.setQueryData(
				customFieldsKeys.all,
				(customFields: Array<CustomField>) => {
					const newCustomFields = customFields?.filter(
						customField => !ids.includes(customField.id)
					);

					return newCustomFields;
				}
			);
			queryClient.invalidateQueries({ queryKey: customFieldsKeys.all });

			toast.success("Campo(s) personalizado(s) deletado(s) com sucesso");
		},
		onError: ({ message }) => {
			toast.error(`Erro ao deletar campo(s) personalizado(s): ${message}`);
		},
	});

	return deleteCustomFieldMutation;
};
