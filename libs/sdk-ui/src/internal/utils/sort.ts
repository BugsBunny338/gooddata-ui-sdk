// (C) 2019-2020 GoodData Corporation
import every = require("lodash/every");
import get = require("lodash/get");
import includes = require("lodash/includes");
import isEmpty = require("lodash/isEmpty");
import isNil = require("lodash/isNil");
import omitBy = require("lodash/omitBy");
import set = require("lodash/set");
import {
    bucketAttributes,
    IAttributeSortItem,
    IBucket,
    IInsight,
    IMeasure,
    insightBucket,
    insightMeasures,
    insightSorts,
    newAttributeSort,
    newMeasureSort,
    SortDirection,
    SortEntityIds,
    sortEntityIds,
    SortItem,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "../../base";
import { SORT_DIR_ASC, SORT_DIR_DESC } from "../constants/sort";
import { IBucketItem, IBucketOfFun, IExtendedReferencePoint } from "../interfaces/Visualization";

import { getFirstAttribute, getFirstValidMeasure } from "./bucketHelper";

export function getMeasureSortItems(identifier: string, direction: SortDirection): SortItem[] {
    return [newMeasureSort(identifier, direction)];
}

export function getAttributeSortItem(
    identifier: string,
    direction: SortDirection = "asc",
    aggregation: boolean = false,
): SortItem {
    const attributeSortItemWithoutAggregation = {
        attributeIdentifier: identifier,
        direction,
    };

    const attributeSortItem: IAttributeSortItem = {
        attributeSortItem: aggregation
            ? {
                  ...attributeSortItemWithoutAggregation,
                  aggregation: "sum",
              }
            : attributeSortItemWithoutAggregation,
    };

    return attributeSortItem;
}

function getDefaultTableSort(insight: IInsight): SortItem[] {
    const rowBucket = insightBucket(insight, BucketNames.ATTRIBUTE);
    const rowAttributes = rowBucket ? bucketAttributes(rowBucket) : [];

    if (rowAttributes.length > 0) {
        return [newAttributeSort(rowAttributes[0], SORT_DIR_ASC)];
    }

    const measures = insightMeasures(insight);

    if (measures.length > 0) {
        return [newMeasureSort(measures[0], SORT_DIR_DESC)];
    }

    return [];
}

function getDefaultBarChartSort(insight: IInsight, canSortStackTotalValue: boolean = false): SortItem[] {
    const measures = insightMeasures(insight);
    const viewBucket = insightBucket(insight, BucketNames.VIEW);
    const stackBucket = insightBucket(insight, BucketNames.STACK);
    const viewBy = viewBucket ? bucketAttributes(viewBucket) : [];
    const stackBy = stackBucket ? bucketAttributes(stackBucket) : [];

    if (viewBy.length === 2) {
        if (measures.length >= 2 && !canSortStackTotalValue) {
            return [
                newAttributeSort(viewBy[0], SORT_DIR_DESC, true),
                newMeasureSort(measures[0], SORT_DIR_DESC),
            ];
        }

        return [
            newAttributeSort(viewBy[0], SORT_DIR_DESC, true),
            newAttributeSort(viewBy[1], SORT_DIR_DESC, true),
        ];
    }

    if (!isEmpty(viewBy) && !isEmpty(stackBy)) {
        return [newAttributeSort(viewBy[0], SORT_DIR_DESC, true)];
    }

    if (!isEmpty(viewBy) && canSortStackTotalValue) {
        return [newAttributeSort(viewBy[0], SORT_DIR_DESC, true)];
    }

    return !isEmpty(measures) ? [newMeasureSort(measures[0], SORT_DIR_DESC)] : [];
}

export function getDefaultTreemapSortFromBuckets(
    viewBy: IBucket,
    segmentBy: IBucket,
    measures: IMeasure[],
): SortItem[] {
    const viewAttr = viewBy ? bucketAttributes(viewBy) : [];
    const stackAttr = segmentBy ? bucketAttributes(segmentBy) : [];

    if (!isEmpty(viewAttr) && !isEmpty(stackAttr)) {
        return [newAttributeSort(viewAttr[0], "asc"), ...measures.map(m => newMeasureSort(m, "desc"))];
    }

    return [];
}

export function getDefaultTreemapSort(insight: IInsight): SortItem[] {
    return getDefaultTreemapSortFromBuckets(
        insightBucket(insight, BucketNames.VIEW),
        insightBucket(insight, BucketNames.SEGMENT),
        insightMeasures(insight),
    );
}

// Consider disolving this function into individual components
export function createSorts(
    type: string,
    insight: IInsight,
    canSortStackTotalValue: boolean = false,
): SortItem[] {
    switch (type) {
        case VisualizationTypes.TABLE:
            const sorts = insightSorts(insight);

            return !isEmpty(sorts) ? sorts : getDefaultTableSort(insight);
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.LINE:
            return [];
        case VisualizationTypes.BAR:
            return getDefaultBarChartSort(insight, canSortStackTotalValue);
        case VisualizationTypes.TREEMAP:
            return getDefaultTreemapSort(insight);
    }
    return [];
}

export function getBucketItemIdentifiers(referencePoint: IExtendedReferencePoint): string[] {
    const buckets: IBucketOfFun[] = get(referencePoint, "buckets", []);
    return buckets.reduce((localIdentifiers: string[], bucket: IBucketOfFun): string[] => {
        const items: IBucketItem[] = get(bucket, "items", []);
        return localIdentifiers.concat(items.map((item: IBucketItem): string => item.localIdentifier));
    }, []);
}

function isSortItemValid(item: SortItem, identifiers: string[]) {
    const sortIdentifiers: SortEntityIds = sortEntityIds(item);

    return every(sortIdentifiers.allIdentifiers, id => includes(identifiers, id));
}

export function removeSort(referencePoint: Readonly<IExtendedReferencePoint>) {
    if (referencePoint.properties) {
        const properties = omitBy(
            {
                ...referencePoint.properties,
                sortItems: null,
            },
            isNil,
        );

        return {
            ...referencePoint,
            properties,
        };
    }

    return referencePoint;
}

export function removeInvalidSort(referencePoint: Readonly<IExtendedReferencePoint>) {
    if (referencePoint.properties) {
        const identifiers = getBucketItemIdentifiers(referencePoint);

        let sortItems = referencePoint.properties.sortItems || [];
        sortItems = sortItems.filter((item: SortItem) => {
            return isSortItemValid(item, identifiers);
        });

        return {
            ...referencePoint,
            properties: {
                ...referencePoint.properties,
                sortItems,
            },
        };
    }

    return referencePoint;
}

export function setSortItems(referencePoint: IExtendedReferencePoint) {
    const buckets = referencePoint.buckets;
    const sortItems = get(referencePoint, ["properties", "sortItems"], []);

    if (sortItems.length > 0) {
        return referencePoint;
    }

    const firstMeasure = getFirstValidMeasure(buckets);
    const firstAttribute = getFirstAttribute(buckets);
    if (firstMeasure !== null && firstAttribute == null) {
        set(
            referencePoint,
            ["properties", "sortItems"],
            getMeasureSortItems(firstMeasure.localIdentifier, SORT_DIR_DESC),
        );
    } else if (firstAttribute !== null) {
        set(
            referencePoint,
            ["properties", "sortItems"],
            [getAttributeSortItem(firstAttribute.localIdentifier, SORT_DIR_ASC)],
        );
    }

    return referencePoint;
}
