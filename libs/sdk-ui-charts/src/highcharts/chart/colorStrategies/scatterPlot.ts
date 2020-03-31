// (C) 2020 GoodData Corporation
import { PointsChartColorStrategy } from "./pointsChart";
import { IColorPalette } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { IColorAssignment } from "@gooddata/sdk-ui";
import { ICreateColorAssignmentReturnValue } from "./base";

export class ScatterPlotColorStrategy extends PointsChartColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _viewByAttribute: any,
        _stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const colorAssignment = this.singleMeasureColorMapping(colorPalette, colorMapping, dv);
        return {
            fullColorAssignment: colorAssignment,
        };
    }

    protected createPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        _viewByAttribute: any,
        stackByAttribute: any,
    ): string[] {
        return super.createSingleColorPalette(colorPalette, colorAssignment, stackByAttribute);
    }
}
