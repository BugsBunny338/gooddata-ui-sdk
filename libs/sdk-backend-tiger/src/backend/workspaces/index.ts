// (C) 2019-2020 GoodData Corporation
import { IWorkspaceQueryFactory, IWorkspaceQuery, IWorkspaceQueryResult } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../types";
import { IWorkspace } from "@gooddata/sdk-model";

export class TigerWorkspaceQueryFactory implements IWorkspaceQueryFactory {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public forUser(userId: string): IWorkspaceQuery {
        return new TigerWorkspaceQuery(this.authCall, userId);
    }

    public forCurrentUser(): IWorkspaceQuery {
        return new TigerWorkspaceQuery(this.authCall);
    }
}

class TigerWorkspaceQuery implements IWorkspaceQuery {
    private limit: number = 100;
    private offset: number = 0;
    private search: string | undefined = undefined;

    constructor(
        // @ts-ignore
        private readonly authCall: TigerAuthenticatedCallGuard,
        // @ts-ignore
        private readonly userId?: string,
    ) {}

    public withLimit(limit: number): IWorkspaceQuery {
        this.limit = limit;
        return this;
    }

    public withOffset(offset: number): IWorkspaceQuery {
        this.offset = offset;
        return this;
    }

    public withSearch(search: string): IWorkspaceQuery {
        this.search = search;
        return this;
    }

    public query(): Promise<IWorkspaceQueryResult> {
        return this.queryWorker(this.offset, this.limit, this.search);
    }

    private async queryWorker(
        offset: number,
        limit: number,
        search?: string,
    ): Promise<IWorkspaceQueryResult> {
        const emptyResult: IWorkspaceQueryResult = {
            search,
            items: [],
            limit,
            offset,
            totalCount: 0,
            next: () => Promise.resolve(emptyResult),
        };

        /*
         * Tiger has no service to obtain list of workspaces yet. Thus hardcoding all available workspaces
         * it may support.
         *
         * List taken from NAS code: sqlexecutor/databaseaccess/DataSourceService.kt
         */
        const workspaces: IWorkspace[] = [
            {
                title: "TPC-H - Postgres",
                id: "tpch",
                description: "",
                isDemo: true,
            },
            {
                title: "GoodSales - Postgres",
                id: "goodsales",
                description: "",
                isDemo: true,
            },
            {
                title: "UFO - Postgres",
                id: "ufo",
                description: "",
                isDemo: true,
            },
            {
                title: "TPC-H - Redshift",
                id: "tpch_rs",
                description: "",
                isDemo: true,
            },
            {
                title: "GoodSales - Redshift",
                id: "goodsales_rs",
                description: "",
                isDemo: true,
            },
            {
                title: "UFO - Redshift",
                id: "ufo_rs",
                description: "",
                isDemo: true,
            },
        ];

        return {
            search,
            items: workspaces,
            limit,
            offset,
            totalCount: workspaces.length,
            next: () => Promise.resolve(emptyResult),
        };
    }
}
