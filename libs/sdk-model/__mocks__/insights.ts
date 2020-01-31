// (C) 2019 GoodData Corporation
import { SortItem, VisualizationProperties } from "../src";
import { IBucket } from "../src/execution/buckets";
import { IInsight } from "../src/insight";
import { IFilter } from "../src/execution/filter";
import identity = require("lodash/identity");

/*
 * Factory & builder for insight instances. Keeping it in test infrastructure for now, will see later on
 * whether we should move it to prod code and expose on public API.
 */

export function newInsight(visClassId: string, modifications: InsightsModifications = identity): IInsight {
    const builder = new InsightBuilder(visClassId);

    return modifications(builder).build();
}

export type InsightsModifications = (builder: InsightBuilder) => InsightBuilder;

export class InsightBuilder {
    private insight: IInsight["insight"];

    constructor(visClassUri: string) {
        this.insight = {
            visualizationUrl: visClassUri,
            title: "Untitled",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
            identifier: "random",
            uri: "random",
        };
    }

    public title = (title: string): InsightBuilder => {
        this.insight.title = title;

        return this;
    };

    public buckets = (buckets: IBucket[]): InsightBuilder => {
        this.insight.buckets = buckets;

        return this;
    };

    public filters = (filters: IFilter[]): InsightBuilder => {
        this.insight.filters = filters;

        return this;
    };

    public sorts = (sorts: SortItem[]): InsightBuilder => {
        this.insight.sorts = sorts;

        return this;
    };

    public properties = (properties: VisualizationProperties): InsightBuilder => {
        this.insight.properties = properties;

        return this;
    };

    public isLocked = (isLocked: boolean): InsightBuilder => {
        this.insight.isLocked = isLocked;

        return this;
    };

    public updated = (updated: string): InsightBuilder => {
        this.insight.updated = updated;

        return this;
    };

    public build = (): IInsight => {
        return {
            insight: this.insight,
        };
    };
}
