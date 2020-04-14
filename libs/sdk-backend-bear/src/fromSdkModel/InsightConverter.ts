// (C) 2019-2020 GoodData Corporation
import { GdcVisualizationObject } from "@gooddata/gd-bear-model";
import {
    IInsightDefinition,
    insightBuckets,
    insightVisualizationUrl,
    IBucket,
    AttributeOrMeasure,
    isMeasure,
    IAttribute,
    attributeLocalId,
    attributeAlias,
    attributeAttributeDisplayFormObjRef,
    insightTitle,
    insightFilters,
    insightProperties,
    insightId,
    insightUri,
    insightIsLocked,
    IInsight,
} from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";
import omitBy from "lodash/omitBy";
import { convertUrisToReferences } from "../toSdkModel/ReferenceConverter";
import { serializeProperties } from "../toSdkModel/PropertiesConverter";
import { convertExtendedFilter, shouldFilterBeIncluded } from "./FilterConverter";
import { convertMeasure } from "./MeasureConverter";

const convertAttribute = (attribute: IAttribute): GdcVisualizationObject.IAttribute => {
    const alias = attributeAlias(attribute);

    return {
        visualizationAttribute: {
            localIdentifier: attributeLocalId(attribute),
            displayForm: attributeAttributeDisplayFormObjRef(attribute),
            ...(alias && { alias }),
        },
    };
};

const convertBucketItem = (bucketItem: AttributeOrMeasure): GdcVisualizationObject.BucketItem => {
    return isMeasure(bucketItem) ? convertMeasure(bucketItem) : convertAttribute(bucketItem);
};

const convertBucket = (bucket: IBucket): GdcVisualizationObject.IBucket => {
    const { totals } = bucket;
    return {
        items: bucket.items.map(convertBucketItem),
        localIdentifier: bucket.localIdentifier,
        ...(!isEmpty(totals) && { totals }),
    };
};

const convertInsightContent = (
    insight: IInsightDefinition,
): GdcVisualizationObject.IVisualizationObjectContent => {
    const { properties, references } = convertUrisToReferences({
        properties: insightProperties(insight),
        references: {},
    });

    const nonEmptyProperties = omitBy(properties, (value, key) => key !== "controls" && isEmpty(value));

    const filters = insightFilters(insight)
        .filter(shouldFilterBeIncluded)
        .map(convertExtendedFilter);

    return {
        buckets: insightBuckets(insight).map(convertBucket),
        visualizationClass: { uri: insightVisualizationUrl(insight) },
        ...(!isEmpty(nonEmptyProperties) && {
            properties: serializeProperties(nonEmptyProperties),
        }),
        ...(!isEmpty(filters) && { filters }),
        ...(!isEmpty(references) && { references }),
    };
};

export const convertInsightDefinition = (
    insight: IInsightDefinition,
): GdcVisualizationObject.IVisualizationObject => {
    return {
        content: convertInsightContent(insight),
        meta: {
            title: insightTitle(insight),
        },
        // tslint:disable-next-line no-object-literal-type-assertion
    } as GdcVisualizationObject.IVisualizationObject;
};

export const convertInsight = (insight: IInsight): GdcVisualizationObject.IVisualizationObject => {
    const convertedDefinition = convertInsightDefinition(insight);
    const locked = insightIsLocked(insight);

    return {
        content: convertedDefinition.content,
        meta: {
            ...convertedDefinition.meta,
            identifier: insightId(insight),
            uri: insightUri(insight),
            ...(locked && { locked }),
        },
    };
};
