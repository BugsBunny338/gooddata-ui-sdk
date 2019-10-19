// (C) 2019 GoodData Corporation
import { useState, useEffect } from "react";
import sdk from "@gooddata/gd-bear-client";

import { projectId } from "../../utils/fixtures";
import { useAuth, AuthStatus } from "../../context/auth";
import { DemoProjectAuthStatus, IDemoProjectState } from "./types";

const uriToId = (uri: string) => uri.split("/").pop();
const isDemoProjectAssignedToUser = (projects: any[]) =>
    projects.some(project => {
        return uriToId(project.links.metadata) === projectId;
    });

const initialState = {
    authStatus: DemoProjectAuthStatus.AUTHORIZING,
};

export const useDemoProjectAuth = () => {
    const { authStatus: userAuthStatus } = useAuth();
    const [{ authStatus, profileUri, projects, error }, setState] = useState<IDemoProjectState>(initialState);
    const hasUserDemoProjectAssigned = projects && isDemoProjectAssignedToUser(projects);

    const setProfileUri = (profileUri: string) => setState(state => ({ ...state, profileUri }));
    const setProjects = (projects: any[]) => setState(state => ({ ...state, projects }));
    const setAuthStatus = (authStatus: DemoProjectAuthStatus) =>
        setState(state => ({ ...state, authStatus }));
    const setCheckProjectAvailabilityError = (error: string) =>
        setState(state => ({
            ...state,
            error: `Could not confirm demo project availability. Examples might not have access to the demo project with id ${projectId}.
            You can try logging out and logging back in. ${error}`,
        }));

    // get profile uri when user is authorized, set unauthorized state elsewhere
    useEffect(() => {
        const getProfileUri = async () => {
            const accountInfo = await sdk.user.getAccountInfo();
            return accountInfo.profileUri as string;
        };

        if (userAuthStatus === AuthStatus.AUTHORIZED) {
            setAuthStatus(DemoProjectAuthStatus.CHECKING_DEMO_AVAILABILITY);
            getProfileUri()
                .then(setProfileUri)
                .catch(setCheckProjectAvailabilityError);
        } else if (userAuthStatus === AuthStatus.UNAUTHORIZED) {
            setAuthStatus(DemoProjectAuthStatus.UNAUTHORIZED);
        }
    }, [userAuthStatus]);

    // get user projects
    useEffect(() => {
        const getProjects = async () => {
            const userId = uriToId(profileUri);
            const projects = await sdk.project.getProjects(userId);
            return projects;
        };

        if (profileUri) {
            getProjects()
                .then(setProjects)
                .catch(setCheckProjectAvailabilityError);
        }
    }, [profileUri]);

    // when demo project is not assigned to user, assign it
    useEffect(() => {
        const assignProjectToUser = async () => {
            await sdk.xhr.post("/api/assign-project", {
                data: {
                    user: profileUri,
                },
            });
        };

        if (projects && !hasUserDemoProjectAssigned) {
            setAuthStatus(DemoProjectAuthStatus.ASSIGNING_DEMO_PROJECT_TO_USER);
            assignProjectToUser()
                .then(() => setAuthStatus(DemoProjectAuthStatus.AUTHORIZED))
                .catch(setCheckProjectAvailabilityError);
        } else if (projects && hasUserDemoProjectAssigned) {
            setAuthStatus(DemoProjectAuthStatus.AUTHORIZED);
        }
    }, [projects, hasUserDemoProjectAssigned]);

    return {
        authStatus,
        error,
    };
};
