// (C) 2019-2020 GoodData Corporation

import { IPagedResource } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export function identifierToRecording(id: string): string {
    return id.replace(/\./g, "_");
}

/**
 * @internal
 */
export class RecordingPager<T> implements IPagedResource<T> {
    public readonly items: T[];
    public readonly limit: number;
    public readonly offset: number;
    public readonly totalCount: number;

    constructor(private readonly all: T[], limit: number = 50, offset: number = 0) {
        // this will naturally return empty items if at the end of data; limit will always be positive
        this.items = all.slice(offset, offset + limit);

        // offset is at most at the end of all available elements
        this.offset = Math.min(offset, all.length);
        // limit is capped to size of current page

        this.limit = Math.max(limit, this.items.length);

        this.totalCount = all.length;
    }

    public next(): Promise<IPagedResource<T>> {
        if (this.items.length === 0) {
            return Promise.resolve(this);
        }

        return Promise.resolve(new RecordingPager(this.all, this.limit, this.offset + this.items.length));
    }
}
