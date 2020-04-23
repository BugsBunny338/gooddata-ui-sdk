// (C) 2019-2020 GoodData Corporation
import { IWorkspace } from "@gooddata/sdk-model";
import { IPagedResource } from "../common/paging";
import { IExecutionFactory } from "./execution";
import { IWorkspaceInsights } from "./insights";
import { IWorkspaceStylingService } from "./styling";
import { IElementQueryFactory } from "./elements";
import { IWorkspaceSettingsService } from "./settings";
import { IWorkspaceCatalogFactory } from "./ldm/catalog";
import { IWorkspaceDatasetsService } from "./ldm/datasets";
import { IWorkspacePermissionsFactory } from "./permissions";
import { IWorkspaceMetadata } from "./metadata";
import { IWorkspaceDashboards } from "./dashboards";

/**
 * Represents an analytical workspace hosted on a backend. It is an entry point to various services that can be
 * used to inspect and modify the workspace and run executions to obtain analytics for the workspace.
 *
 * @public
 */
export interface IAnalyticalWorkspace {
    readonly workspace: string;

    /**
     * Returns service that can be used to query workspace catalog items - attributes, measures, facts and date data sets
     */
    catalog(): IWorkspaceCatalogFactory;

    /**
     * Returns service that can be used to query and update insights
     */
    insights(): IWorkspaceInsights;

    /**
     * Returns service that can be used to query and update dashboards
     */
    dashboards(): IWorkspaceDashboards;

    /**
     * Returns service that can be used to perform read and write operations on subset of workspace's metadata.
     */
    metadata(): IWorkspaceMetadata;

    /**
     * Returns service that can be used to query data sets defined in this workspace.
     */
    dataSets(): IWorkspaceDatasetsService;

    /**
     * Returns execution factory - which is an entry point to triggering executions and thus obtaining
     * analytics from the workspace.
     */
    execution(): IExecutionFactory;

    /**
     * Returns service that can be used to query attribute elements for attributes defined in this workspace. For
     * instance if workspace has data set Employee with attribute Name, then this service can be used to retrieve
     * names of all employees.
     */
    elements(): IElementQueryFactory;

    /**
     * Returns service that can be used to query workspace permissions
     */
    permissions(): IWorkspacePermissionsFactory;

    /**
     * Returns service that can be used to obtain settings that are currently in effect for the workspace.
     */
    settings(): IWorkspaceSettingsService;

    /**
     * Returns service that can be used to obtain workspace styling settings. These settings specify for instance
     * what colors should be used in the charts.
     */
    styling(): IWorkspaceStylingService;
}

/**
 * Factory providing creating queries used to get available workspaces.
 *
 * @public
 */
export interface IWorkspaceQueryFactory {
    /**
     * Creates a query for workspaces available to the specified user.
     *
     * @param userId - id of the user to retrieve workspaces for
     * @public
     */
    forUser(userId: string): IWorkspaceQuery;

    /**
     * Creates a query for workspaces available to the user currently logged in.
     *
     * @public
     */
    forCurrentUser(): IWorkspaceQuery;
}

/**
 * Query to retrieve available worksapces.
 *
 * @public
 */
export interface IWorkspaceQuery {
    /**
     * Sets a limit on how many items to retrieve at once.
     * @param limit - how many items to retrieve at most
     *
     * @public
     */
    withLimit(limit: number): IWorkspaceQuery;

    /**
     * Sets a number of items to skip.
     * @param offset - how many items to skip
     */
    withOffset(offset: number): IWorkspaceQuery;

    /**
     * Sets a text to search
     * @param search - text to search
     */
    withSearch(search: string): IWorkspaceQuery;

    /**
     * Executes the query and returns the result asynchronously.
     */
    query(): Promise<IWorkspaceQueryResult>;
}

/**
 * Paged resource with results of a workspace query.
 *
 * @public
 */
export interface IWorkspaceQueryResult extends IPagedResource<IWorkspace> {
    search: string | undefined;
}
