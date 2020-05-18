// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { newMeasureValueFilter, IMeasureValueFilter, measureIdentifier, idRef } from "@gooddata/sdk-model";
import { LdmExt } from "../../../ldm";
import { IMeasureValueFilterState } from "./MeasureValueFilterExample";

const measures = [LdmExt.TotalSales2, LdmExt.numberOfChecks];

const attributes = [LdmExt.LocationName];

const greaterThanFilter = newMeasureValueFilter(
    idRef(measureIdentifier(LdmExt.TotalSales2)!),
    "GREATER_THAN",
    7000000,
);

export class MeasureValueFilterExample extends Component<{}, IMeasureValueFilterState> {
    constructor(props: any) {
        super(props);
        this.state = {
            filters: [],
        };
    }

    public renderPresetButton(label: string, appliedFilters: IMeasureValueFilter[], isActive: boolean) {
        return (
            <button
                className={`gd-button gd-button-secondary ${isActive ? "is-active" : ""} s-filter-button`}
                onClick={() =>
                    this.setState({
                        filters: appliedFilters,
                    })
                }
            >
                {label}
            </button>
        );
    }

    public render() {
        const { filters } = this.state;
        return (
            <div>
                <div>
                    {this.renderPresetButton("All total sales", [], filters.length === 0)}
                    {this.renderPresetButton(
                        "Total sales greater than 7,000,000 (stacked to 100%)",
                        [greaterThanFilter],
                        filters.length > 0,
                    )}
                </div>
                <hr className="separator" />
                <div style={{ height: 300 }} className="s-stacked-bar">
                    <BarChart
                        measures={measures}
                        viewBy={attributes}
                        config={{
                            stackMeasuresToPercent: true,
                            dataLabels: {
                                visible: true,
                            },
                        }}
                        filters={filters}
                    />
                </div>
            </div>
        );
    }
}

export default MeasureValueFilterExample;
