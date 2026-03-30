import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Project {
    id: bigint;
    region: string;
    dataDelivery: string;
    projectName: string;
    qnrName: string;
    projectLaunchDate: string;
    createdAt: bigint;
    receivedDate: string;
    quotaRedirectStatus: string;
    linkStatus: string;
    linkComments: string;
    dataStatus: string;
}
export interface EditEntry {
    id: bigint;
    oldValue: string;
    newValue: string;
    projectId: bigint;
    timestamp: bigint;
    fieldName: string;
}
export interface backendInterface {
    addProject(project: Project): Promise<bigint>;
    deleteProject(projectId: bigint): Promise<boolean>;
    getAllProjects(): Promise<Array<Project>>;
    getEditHistory(projectId: bigint, fieldName: string): Promise<Array<EditEntry>>;
    getProjectEditHistory(projectId: bigint): Promise<Array<EditEntry>>;
    getProjectsByRegion(region: string): Promise<Array<Project>>;
    updateProjectField(projectId: bigint, fieldName: string, newValue: string): Promise<boolean>;
}
