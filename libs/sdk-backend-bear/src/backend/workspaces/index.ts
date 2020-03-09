// (C) 2019-2020 GoodData Corporation
import { IWorkspaceQueryFactory, IWorkspaceQuery, IWorkspaceQueryResult } from "@gooddata/sdk-backend-spi";
import { convertUserProject } from "../../fromSdkModel/WorkspaceConverter";
import { BearAuthenticatedCallGuard } from "../../types";

export class BearWorkspaceQueryFactory implements IWorkspaceQueryFactory {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public forUser(userId: string): IWorkspaceQuery {
        return new BearWorkspaceQuery(this.authCall, userId);
    }

    public forCurrentUser(): IWorkspaceQuery {
        return new BearWorkspaceQuery(this.authCall);
    }
}

class BearWorkspaceQuery implements IWorkspaceQuery {
    private limit: number = 100;
    private offset: number = 0;
    private search: string | undefined = undefined;

    constructor(private readonly authCall: BearAuthenticatedCallGuard, private readonly userId?: string) {}

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
        const {
            userProjects: { paging, items },
        } = await this.authCall(async (sdk, { principal }) => {
            const userId = this.userId || principal.userId;
            return sdk.project.getProjectsWithPaging(userId, offset, limit, search);
        });

        const serverOffset = paging.offset;
        const { totalCount, count } = paging;

        const hasNextPage = serverOffset + count < totalCount;

        const emptyResult: IWorkspaceQueryResult = {
            search,
            items: [],
            limit: count,
            offset: totalCount,
            totalCount,
            next: () => Promise.resolve(emptyResult),
        };

        return {
            search,
            items: items.map(convertUserProject),
            limit: paging.limit,
            offset: paging.offset,
            totalCount: paging.totalCount,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit, search)
                : () => Promise.resolve(emptyResult),
        };
    }
}
