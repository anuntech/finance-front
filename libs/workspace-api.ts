import { CONFIGS } from "@/configs";
import axios from "axios";

export const workspaceApi = axios.create({
	baseURL: CONFIGS.ENVS.WORKSPACE_API_URL || "",
	withCredentials: true,
});
