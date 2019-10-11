// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { ColumnChart } from "@gooddata/sdk-ui";
import {
    newMeasure,
    newAttribute,
    newAttributeSort,
    newMeasureSort,
    IAttributeSortItem,
    IMeasureSortItem,
} from "@gooddata/sdk-model";
import "@gooddata/sdk-ui/styles/css/main.css";

import {
    totalSalesIdentifier,
    locationStateDisplayFormIdentifier,
    locationStateAttributeCaliforniaUri,
    monthDateIdentifier,
    monthDateIdentifierJanuary,
    projectId,
} from "../utils/fixtures";
import { SortDirection } from "@gooddata/gd-bear-client";
import { useBackend } from "../backend";

interface ISortOption {
    key: string;
    label: string;
    overrideDirection?: SortDirection | null;
    description: (dir?: SortDirection) => string;
    sortBy: (dir?: SortDirection) => (IAttributeSortItem | IMeasureSortItem)[];
}

interface IDynamicSortingExampleState {
    sortOption: ISortOption | undefined;
    direction: SortDirection;
}

const getOrderLabel = (direction: SortDirection) => {
    return {
        desc: "descending",
        asc: "ascending",
    }[direction];
};

const style = { height: 600 };

export const DynamicSortingExample: React.FC = () => {
    const backend = useBackend();
    const [state, setState] = useState<IDynamicSortingExampleState>({
        sortOption: undefined,
        direction: "asc",
    });
    const onSortOptionChange = (sortOption: ISortOption) => () =>
        setState(state => ({
            ...state,
            sortOption,
        }));
    const onDirectionChange = (direction: SortDirection) => () =>
        setState(state => ({
            ...state,
            direction,
        }));

    const sortOptions: ISortOption[] = [
        {
            key: "default",
            label: "Default sorting",
            overrideDirection: "asc",
            description: () => "By default, the chart is sorted by the date attribute dir ascending order",
            sortBy: () => [],
        },
        {
            key: "state",
            label: "State",
            description: dir =>
                `The column stacks (states) are sorted alphabetically by the label of the state attribute in ${getOrderLabel(
                    dir,
                )} order.`,
            sortBy: dir => [newAttributeSort(locationStateDisplayFormIdentifier, dir)],
        },
        {
            key: "date",
            label: "Date attribute",
            description: dir =>
                `The columns (date) are sorted by the value of the date attribute in ${getOrderLabel(
                    dir,
                )} order.`,
            sortBy: dir => [newAttributeSort(monthDateIdentifier, dir)],
        },
        {
            key: "sum-of-column",
            label: "Date attribute by sum of the column",
            description: dir =>
                `The columns (date) are sorted by the sum of the Total Sales stacks in each column in ${getOrderLabel(
                    dir,
                )} order.`,
            sortBy: dir => [newAttributeSort(monthDateIdentifier, dir, true)],
        },
        {
            key: "sum-of-stacks",
            label: "State attribute by sum of individual stacks",
            description: dir =>
                `The stacks (state) are sorted by the sum of the Total Sales stacks across all columns in ${getOrderLabel(
                    dir,
                )} order.`,
            sortBy: dir => [newAttributeSort(locationStateDisplayFormIdentifier, dir, true)],
        },
        {
            key: "state-element",
            label: "Measure of California",
            description: dir =>
                `The columns (date) are sorted by the value of the Total Sales of California stack in ${getOrderLabel(
                    dir,
                )} order.`,
            sortBy: dir => [
                newMeasureSort(totalSalesIdentifier, dir, [
                    {
                        attributeIdentifier: locationStateDisplayFormIdentifier,
                        element: locationStateAttributeCaliforniaUri,
                    },
                ]),
            ],
        },
        {
            key: "date-element",
            label: "Measure of January",
            description: dir =>
                `The column stacks (states) are sorted by the value of Total Sales in the January column in ${getOrderLabel(
                    dir,
                )} order.`,
            sortBy: dir => [
                newMeasureSort(totalSalesIdentifier, dir, [
                    {
                        attributeIdentifier: monthDateIdentifier,
                        element: monthDateIdentifierJanuary,
                    },
                ]),
            ],
        },
        {
            key: "multi",
            label: "Multi-sort",
            overrideDirection: null,
            description: () => "You can combine multiple sortItems together, even mix different directions.",
            sortBy: () => [
                newMeasureSort(totalSalesIdentifier, "asc", [
                    {
                        attributeIdentifier: locationStateDisplayFormIdentifier,
                        element: locationStateAttributeCaliforniaUri,
                    },
                ]),
                newMeasureSort(totalSalesIdentifier, "desc", [
                    {
                        attributeIdentifier: monthDateIdentifier,
                        element: monthDateIdentifierJanuary,
                    },
                ]),
            ],
        },
    ];

    const { direction, sortOption = sortOptions[0] } = state;

    const isAsc = sortOption.overrideDirection ? sortOption.overrideDirection === "asc" : direction === "asc";

    const isDesc = sortOption.overrideDirection
        ? sortOption.overrideDirection === "desc"
        : direction === "desc";

    return (
        <div className="s-dynamic-sorting">
            {/* language=CSS */}
            <style jsx>{`
                .sorting-options {
                    margin: -10px -10px 10px -10px;
                    display: flex;
                    flex-wrap: wrap;
                }
                .sorting-option {
                    margin: 5px 10px;
                }
                .sorting-label {
                    margin: 5px 10px;
                    padding: 6px 0;
                }
            `}</style>
            <div className="sorting-options">
                <span className="sorting-label">Sort by</span>
                {sortOptions.map(sortOptionItem => {
                    return (
                        <button
                            key={sortOptionItem.key}
                            className={`sorting-option gd-button gd-button-secondary s-${
                                sortOptionItem.key
                            } ${sortOption.key === sortOptionItem.key ? " is-active" : ""}`}
                            onClick={onSortOptionChange(sortOptionItem)}
                        >
                            {sortOptionItem.label}
                        </button>
                    );
                })}
            </div>
            <div className="sorting-options">
                <span className="sorting-label">Direction</span>
                <button
                    className={`sorting-option gd-button gd-button-secondary s-ascending${
                        isAsc ? " is-active" : ""
                    }`}
                    onClick={onDirectionChange("asc")}
                >
                    Ascending
                </button>
                <button
                    className={`sorting-option gd-button gd-button-secondary s-descending${
                        isDesc ? " is-active" : ""
                    }`}
                    onClick={onDirectionChange("desc")}
                >
                    Descending
                </button>
            </div>
            <p>{sortOption.description(direction)}</p>

            <hr className="separator" />

            <div style={style} className="s-dynamic-sorting-chart">
                <ColumnChart
                    backend={backend}
                    workspace={projectId}
                    measures={[newMeasure(totalSalesIdentifier, undefined, totalSalesIdentifier)]}
                    viewBy={newAttribute(monthDateIdentifier, undefined, monthDateIdentifier)}
                    stackBy={newAttribute(
                        locationStateDisplayFormIdentifier,
                        undefined,
                        locationStateDisplayFormIdentifier,
                    )}
                    sortBy={sortOption.sortBy(direction)}
                />
            </div>
        </div>
    );
};
