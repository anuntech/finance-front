import { workspaceApi } from "@/libs/workspace-api";

export interface Member {
	_id: string;
	email: string;
	name: string;
	role: string;
	icon?: {
		type: string;
		value: string;
	};
}

export const getMembersOfWorkspace = async (workspaceId: string) => {
	try {
		const response = await workspaceApi.get<Array<Member>>(
			`/workspace/members/${workspaceId}`
		);

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
