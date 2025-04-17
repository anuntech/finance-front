import { getMembersOfWorkspace } from "@/http/workspace/members/get";
import { getOwnerOfWorkspace } from "@/http/workspace/owner/get";
import { getS3Image } from "@/libs/s3-client";
import { membersKeys } from "@/queries/keys/members";
import { ownerKeys } from "@/queries/keys/owner";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface Assigned {
	name: string;
	id: string;
	image: string;
}

export const useAssignments = (workspaceId: string) => {
	if (!workspaceId) {
		throw new Error("Workspace ID is required");
	}

	const {
		data: members,
		isLoading: isLoadingMembers,
		isSuccess: isSuccessMembers,
	} = useQuery({
		queryKey: membersKeys.all,
		queryFn: () => getMembersOfWorkspace(workspaceId),
	});

	if (!isSuccessMembers && !isLoadingMembers) {
		toast.error("Erro ao carregar membros");
	}

	const {
		data: owner,
		isLoading: isLoadingOwner,
		isSuccess: isSuccessOwner,
	} = useQuery({
		queryKey: ownerKeys.all,
		queryFn: () => getOwnerOfWorkspace(workspaceId),
	});

	if (!isSuccessOwner && !isLoadingOwner) {
		toast.error("Erro ao carregar proprietário");
	}

	const assignments =
		!isLoadingMembers && !isLoadingOwner && isSuccessMembers && isSuccessOwner
			? ([
					{
						name: owner.name,
						id: owner.id,
						image: owner.icon ? getS3Image(owner.icon.value) : "/shad.png",
					},
					...(members?.map(member => ({
						name: member.name,
						id: member._id,
						image: member.icon ? getS3Image(member.icon.value) : "/shad.png",
					})) ?? []),
				] as Array<Assigned>)
			: [];

	const isLoadingAssignments = isLoadingMembers || isLoadingOwner;
	const isSuccessAssignments = isSuccessMembers && isSuccessOwner;

	const getCurrentUser = (id: string) => {
		return assignments.find(assignment => assignment.id === id);
	};

	return {
		assignments,
		isLoadingAssignments,
		isSuccessAssignments,
		getCurrentUser,
	};
};
