import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EditEntry, Project } from "../backend";
import { useActor } from "./useActor";

export function useGetProjectsByRegion(region: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects", region],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjectsByRegion(region);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProjectEditHistory(projectId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<EditEntry[]>({
    queryKey: ["editHistory", "project", projectId?.toString()],
    queryFn: async () => {
      if (!actor || projectId === null) return [];
      return actor.getProjectEditHistory(projectId);
    },
    enabled: !!actor && !isFetching && projectId !== null,
  });
}

export function useGetFieldEditHistory(
  projectId: bigint | null,
  fieldName: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<EditEntry[]>({
    queryKey: ["editHistory", "field", projectId?.toString(), fieldName],
    queryFn: async () => {
      if (!actor || projectId === null || !fieldName) return [];
      return actor.getEditHistory(projectId, fieldName);
    },
    enabled: !!actor && !isFetching && projectId !== null && !!fieldName,
  });
}

export function useAddProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: Project) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addProject(project);
    },
    onSuccess: () => {
      // Invalidate all region queries since sub-values map to parent tabs
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteProject(projectId);
      if (!result) throw new Error("Project not found");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProjectField() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      fieldName,
      newValue,
      region,
    }: {
      projectId: bigint;
      fieldName: string;
      newValue: string;
      region: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateProjectField(
        projectId,
        fieldName,
        newValue,
      );
      return { result, region, fieldName };
    },
    onSuccess: ({ fieldName }) => {
      // When region field changes, invalidate all tabs since a project may move between tabs
      // For other fields, also invalidate all to keep things consistent
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (fieldName !== "region") {
        queryClient.invalidateQueries({ queryKey: ["editHistory"] });
      }
    },
  });
}
