// (C) 2019-2020 GoodData Corporation
import { GdcProject, GdcUser } from "@gooddata/gd-bear-model";
import { IWorkspace, IWorkspacePermissions } from "@gooddata/sdk-model";

export const convertUserProject = ({ userProject }: GdcProject.IUserProject): IWorkspace => {
    const workspace: IWorkspace = {
        description: userProject.projectDescription,
        title: userProject.projectTitle,
        id: userProject.links.self.match(/\/gdc\/projects\/(.+)/i)![1],
    };

    if (userProject.isDemo) {
        workspace.isDemo = true;
    }

    return workspace;
};

export const convertPermissions = ({ permissions }: GdcUser.IProjectPermissions): IWorkspacePermissions => {
    const workspacePermissions = Object.keys(permissions).reduce(
        (acc: Partial<IWorkspacePermissions>, permission) => {
            const hasPermission = permissions[permission as GdcUser.ProjectPermission];
            return {
                ...acc,
                [permission]: hasPermission === "1",
            };
        },
        {},
    );

    return workspacePermissions as IWorkspacePermissions;
};
