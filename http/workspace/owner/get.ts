import { workspaceApi } from "@/libs/workspace-api";

export interface Owner {
	id: string;
	email: string;
	name: string;
	role: string;
	icon?: {
		type: string;
		value: string;
	};
}

export const getOwnerOfWorkspace = async (workspaceId: string) => {
	try {
		const response = await workspaceApi.get<Owner>(
			`/workspace/owner/${workspaceId}`
		);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
