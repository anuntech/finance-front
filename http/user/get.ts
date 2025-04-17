import { workspaceApi } from "@/libs/workspace-api";

interface IUser {
	_id: string;
	name: string;
	icon?: {
		type: string;
		value: string;
	};
}

export const getUser = async () => {
	try {
		const response = await workspaceApi.get<IUser>("/user");

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
