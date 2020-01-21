// // (C) 2020 GoodData Corporation
import {
    convertAbsoluteDateFilter,
    convertRelativeDateFilter,
    convertMeasureValueFilter,
    convertFilter,
    convertMeasureFilter,
} from "../FilterConverter";
import {
    absoluteFilter,
    relativeFilter,
    measureValueFilterWithoutCondition,
    negativeEmptyAttributeFilter,
} from "./InvalidInputs.fixture";
import {
    newAbsoluteDateFilter,
    newRelativeDateFilter,
    newMeasureValueFilter,
    newPositiveAttributeFilter,
    DateGranularity,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";

describe("bear filter converter from model to AFM", () => {
    describe("convert absolute date filter", () => {
        const Scenarios: Array<[string, any]> = [
            [
                "convert absolute date filter from model to AFM",
                newAbsoluteDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, "2019-08-06", "2019-08-12"),
            ],
            ["return null when from is undefined", absoluteFilter.withoutFrom],
            ["return null when to is undefined", absoluteFilter.withoutTo],
        ];
        it.each(Scenarios)("it should %s", (_desc, input) => {
            expect(convertAbsoluteDateFilter(input)).toMatchSnapshot();
        });
    });

    describe("convert relative date filter", () => {
        const Scenarios: Array<[string, any]> = [
            [
                "AFM relative date filter with year granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.year, 2, 7),
            ],
            [
                "AFM relative date filter with month granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.month, -3, 9),
            ],
            [
                "AFM relative date filter with quarter granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.quarter, 25, -2),
            ],
            [
                "AFM relative date filter with date granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.date, -11, 0),
            ],
            [
                "AFM relative date filter with week granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.week, 50, 100),
            ],
            ["null when from is undefined", relativeFilter.withoutFrom],
            ["null when to is undefined", relativeFilter.withoutTo],
        ];

        it.each(Scenarios)("should return %s", (_desc, input) => {
            expect(convertRelativeDateFilter(input)).toMatchSnapshot();
        });
    });

    describe("convert measure value filter", () => {
        const Scenarios: Array<[string, any]> = [
            [
                "AFM measure value filter with greater than operator",
                newMeasureValueFilter(ReferenceLdm.Amount, "GREATER_THAN", 10, undefined),
            ],
            [
                "AFM measure value filter with greater than or equal to operator",
                newMeasureValueFilter(ReferenceLdm.Amount, "GREATER_THAN_OR_EQUAL_TO", -5, undefined),
            ],
            [
                "AFM measure value filter with less than operator",
                newMeasureValueFilter(ReferenceLdm.Amount, "LESS_THAN", 13, undefined),
            ],
            [
                "AFM measure value filter with less than or equal to operator",
                newMeasureValueFilter(ReferenceLdm.Amount, "LESS_THAN_OR_EQUAL_TO", 13, undefined),
            ],
            [
                "AFM measure value filter with equal to operator",
                newMeasureValueFilter(ReferenceLdm.Amount, "EQUAL_TO", 18, undefined),
            ],
            [
                "AFM measure value filter with not equal to operator",
                newMeasureValueFilter(ReferenceLdm.Amount, "NOT_EQUAL_TO", 3, undefined),
            ],
            [
                "AFM measure value filter with between operator",
                newMeasureValueFilter(ReferenceLdm.Amount, "BETWEEN", 3, 45),
            ],
            [
                "AFM measure value filter with not between operator",
                newMeasureValueFilter(ReferenceLdm.Amount, "NOT_BETWEEN", 1, 5),
            ],
            ["null when condition is undefined", measureValueFilterWithoutCondition],
        ];
        it.each(Scenarios)("should return %s", (_desc, input) => {
            expect(convertMeasureValueFilter(input)).toMatchSnapshot();
        });
    });

    describe("convert filter", () => {
        const Scenarios: Array<[string, any]> = [
            ["value filter", newMeasureValueFilter(ReferenceLdm.Amount, "BETWEEN", 3, 9)],
            [
                "filter returns absolute date filter",
                newAbsoluteDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, "2019-08-06", "2019-08-12"),
            ],
            [
                "filter returns positive attribute filter",
                newPositiveAttributeFilter(ReferenceLdm.Product.Name, ["value"]),
            ],
            [
                "filter returns negative attribute filter",
                newNegativeAttributeFilter(ReferenceLdm.Product.Name, ["other value"]),
            ],
            [
                "filter returns relative date filter",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.date, 2, 55),
            ],
        ];
        it.each(Scenarios)("returns AFM measure %s", (_desc, input) => {
            expect(convertFilter(input)).toMatchSnapshot();
        });
    });

    describe("convert measure filter", () => {
        const Scenarios: Array<[string, any]> = [
            [
                "AFM measure filter returns relative date filter",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.date, 5, 22),
            ],
            [
                "AFM measure filter returns positive attribute filter",
                newPositiveAttributeFilter(ReferenceLdm.Product.Name, ["value"]),
            ],
            [
                "AFM measure filter returns negative attribute filter",
                newNegativeAttributeFilter(ReferenceLdm.Product.Name, ["other value"]),
            ],
            [
                "AFM measure filter returns absolute date filter",
                newAbsoluteDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, "2019-08-06", "2019-08-12"),
            ],
            ["null when attribute filter is negative and empty", negativeEmptyAttributeFilter],
        ];
        it.each(Scenarios)("returns %s", (_desc, input) => {
            expect(convertMeasureFilter(input)).toMatchSnapshot();
        });
    });
});
