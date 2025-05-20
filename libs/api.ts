import { CONFIGS } from "@/configs";
import axios from "axios";

export const api = axios.create({
	baseURL: CONFIGS.ENVS.API_URL || "",
	withCredentials: process.env.NODE_ENV === "production",
});

api.interceptors.request.use(async config => {
	const workspaceId = sessionStorage.getItem("workspaceId");

	if (workspaceId) {
		config.headers.workspaceId = workspaceId;
	}

	if (process.env.NODE_ENV === "development") {
		const token = localStorage.getItem("token");

		if (token) {
			config.headers.Authorization = token;
		}
	}

	return config;
});
