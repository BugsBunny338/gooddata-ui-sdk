// (C) 2020 GoodData Corporation
import { parseValue, unwrap } from "../../utils/common";
import { IColorStrategy } from "../colorFactory";
import { MAX_POINT_WIDTH } from "../highcharts/commonConfiguration";
import { bucketIsEmpty, IBucket, Identifier } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { IPointData } from "../../typings/unsafe";
import { DataValue, DataViewFacade, IMeasureGroupDescriptor } from "@gooddata/sdk-backend-spi";
import isEmpty = require("lodash/isEmpty");

const SUPPORTED_MEASURE_BUCKETS: ReadonlyArray<Identifier> = [
    BucketNames.MEASURES,
    BucketNames.SECONDARY_MEASURES,
    BucketNames.TERTIARY_MEASURES,
];

const PRIMARY_VS_COMPARATIVE_MEASURE_HEIGHT_RATIO = 0.75;

const isComparativeMeasurePresent = (bucketLocalIdentifiers: Identifier[]) =>
    bucketLocalIdentifiers.includes(BucketNames.TERTIARY_MEASURES);

const isTargetMeasurePresent = (bucketLocalIdentifiers: Identifier[]) =>
    bucketLocalIdentifiers.includes(BucketNames.SECONDARY_MEASURES);

const getValue = (
    value: number,
    isTarget: boolean,
): {
    y: number;
    target?: number;
} =>
    isTarget
        ? {
              target: value === null ? 0 : value,
              y: 0,
          }
        : {
              y: value,
          };

const getSeriesItemData = (
    seriesItem: string[],
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    seriesIndex: number,
    measureBucketsLocalIdentifiers: Identifier[],
) =>
    seriesItem.map((pointValue: string) => {
        const value = parseValue(pointValue);
        const isTarget = isTargetSeries(seriesIndex, measureBucketsLocalIdentifiers);
        const classNameProp = isTarget && value === null ? { className: "hidden-empty-series" } : {};

        return {
            ...classNameProp,
            ...getValue(value, isTarget),
            format: unwrap(measureGroup.items[seriesIndex]).format,
            marker: {
                enabled: pointValue !== null,
            },
            name: unwrap(measureGroup.items[seriesIndex]).name,
        };
    });

const getPrimarySeriesMaxPointWidth = (onlyPrimaryMeasure: boolean) => {
    if (!onlyPrimaryMeasure) {
        return MAX_POINT_WIDTH * PRIMARY_VS_COMPARATIVE_MEASURE_HEIGHT_RATIO;
    }
    return MAX_POINT_WIDTH;
};

const getPrimarySeries = (seriesItemConfig: IPointData, onlyPrimaryMeasure: boolean) => ({
    ...seriesItemConfig,
    pointPadding: onlyPrimaryMeasure ? 0.1 : 0.2,
    maxPointWidth: getPrimarySeriesMaxPointWidth(onlyPrimaryMeasure),
    zIndex: 1,
    bulletChartMeasureType: "primary",
});

const getTargetSeries = (seriesItemConfig: IPointData) => ({
    ...seriesItemConfig,
    type: "bullet",
    pointPadding: 0,
    targetOptions: {
        width: "100%",
    },
    zIndex: 2,
    bulletChartMeasureType: "target",
});

const getComparativeSeries = (seriesItemConfig: IPointData) => ({
    ...seriesItemConfig,
    pointPadding: 0,
    zIndex: 0,
    bulletChartMeasureType: "comparative",
});

export const isPrimarySeries = (seriesIndex: number, bucketsLocalIdentifiers: Identifier[]) =>
    seriesIndex === bucketsLocalIdentifiers.indexOf(BucketNames.MEASURES);

export const isTargetSeries = (seriesIndex: number, bucketsLocalIdentifiers: Identifier[]) =>
    seriesIndex === bucketsLocalIdentifiers.indexOf(BucketNames.SECONDARY_MEASURES);

export const isComparativeSeries = (seriesIndex: number, bucketsLocalIdentifiers: Identifier[]) =>
    seriesIndex === bucketsLocalIdentifiers.indexOf(BucketNames.TERTIARY_MEASURES);

const getSeries = (
    seriesIndex: number,
    seriesItemConfig: IPointData,
    measureBucketsLocalIdentifiers: Identifier[],
) => {
    if (isTargetSeries(seriesIndex, measureBucketsLocalIdentifiers)) {
        return getTargetSeries(seriesItemConfig);
    } else if (isComparativeSeries(seriesIndex, measureBucketsLocalIdentifiers)) {
        return getComparativeSeries(seriesItemConfig);
    }

    const onlyPrimaryMeasure =
        !isComparativeMeasurePresent(measureBucketsLocalIdentifiers) &&
        !isTargetMeasurePresent(measureBucketsLocalIdentifiers);
    return getPrimarySeries(seriesItemConfig, onlyPrimaryMeasure);
};

export function getBulletChartSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    colorStrategy: IColorStrategy,
) {
    const occupiedMeasureBucketsLocalIdentifiers = getOccupiedMeasureBucketsLocalIdentifiers(dv);
    const executionResultData = dv.twoDimData();

    return executionResultData.map((seriesItem: string[], seriesIndex: number) => {
        const seriesItemData = getSeriesItemData(
            seriesItem,
            measureGroup,
            seriesIndex,
            occupiedMeasureBucketsLocalIdentifiers,
        );

        const seriesItemConfig: IPointData = {
            legendIndex: seriesIndex,
            data: seriesItemData,
            name: measureGroup.items[seriesIndex].measureHeaderItem.name,
            color: colorStrategy.getColorByIndex(seriesIndex),
        };

        return getSeries(seriesIndex, seriesItemConfig, occupiedMeasureBucketsLocalIdentifiers);
    });
}

export function getOccupiedMeasureBucketsLocalIdentifiers(dv: DataViewFacade): Identifier[] {
    const buckets: IBucket[] = dv.buckets();
    const executionResultData: DataValue[][] = dv.twoDimData();

    const availableMeasureBucketsLocalIdentifiers = SUPPORTED_MEASURE_BUCKETS;
    const notEmptyMeasureBucketsLocalIdentifiers = buckets
        .filter(
            b => !bucketIsEmpty(b) && availableMeasureBucketsLocalIdentifiers.indexOf(b.localIdentifier) >= 0,
        )
        .map(b => b.localIdentifier);

    return !isEmpty(notEmptyMeasureBucketsLocalIdentifiers)
        ? notEmptyMeasureBucketsLocalIdentifiers
        : availableMeasureBucketsLocalIdentifiers.slice(0, executionResultData.length);
}
