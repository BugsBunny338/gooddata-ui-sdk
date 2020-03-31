// (C) 2020 GoodData Corporation

import { ColorStrategy, ICreateColorAssignmentReturnValue, isValidMappedColor } from "./base";
import { IColor, IColorFromPalette, IColorPalette, isColorFromPalette, RgbType } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { DataViewFacade, IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import { IColorAssignment } from "@gooddata/sdk-ui";
import { findMeasureGroupInDimensions } from "../../utils/executionResultHelper";
import { getColorByGuid, getColorFromMapping, getLighterColorFromRGB } from "../../utils/color";

const emptyColorPaletteItem: IColorFromPalette = { type: "guid", value: "none" };

export class MeasureColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        _viewByAttribute: any,
        _stackByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const { allMeasuresAssignment, nonDerivedMeasuresAssignment } = this.mapColorsFromMeasures(
            dv,
            colorMapping,
            colorPalette,
        );

        return {
            fullColorAssignment: this.mapColorsFromDerivedMeasure(dv, allMeasuresAssignment, colorPalette),
            outputColorAssignment: nonDerivedMeasuresAssignment,
        };
    }

    private mapColorsFromMeasures(
        dv: DataViewFacade,
        colorMapping: IColorMapping[],
        colorPalette: IColorPalette,
    ): { allMeasuresAssignment: IColorAssignment[]; nonDerivedMeasuresAssignment: IColorAssignment[] } {
        let currentColorPaletteIndex = 0;

        const nonDerivedMeasuresAssignment: IColorAssignment[] = [];
        const measureGroup = findMeasureGroupInDimensions(dv.dimensions());
        const allMeasuresAssignment = measureGroup.items.map((headerItem, index) => {
            if (dv.isDerivedMeasure(measureGroup.items[index])) {
                return {
                    headerItem,
                    color: emptyColorPaletteItem,
                };
            }

            const mappedMeasure: IColorAssignment = this.mapMeasureColor(
                headerItem,
                currentColorPaletteIndex,
                colorPalette,
                colorMapping,
                dv,
            );

            currentColorPaletteIndex++;
            nonDerivedMeasuresAssignment.push(mappedMeasure);

            return mappedMeasure;
        });

        return {
            allMeasuresAssignment,
            nonDerivedMeasuresAssignment,
        };
    }

    private mapMeasureColor(
        descriptor: IMeasureDescriptor,
        currentColorPaletteIndex: number,
        colorPalette: IColorPalette,
        colorAssignment: IColorMapping[],
        dv: DataViewFacade,
    ): IColorAssignment {
        const mappedColor = getColorFromMapping(descriptor, colorAssignment, dv);

        const color: IColor = isValidMappedColor(mappedColor, colorPalette)
            ? mappedColor
            : {
                  type: "guid",
                  value: colorPalette[currentColorPaletteIndex % colorPalette.length].guid,
              };

        return {
            headerItem: descriptor,
            color,
        };
    }

    private mapColorsFromDerivedMeasure(
        dv: DataViewFacade,
        measuresColorAssignment: IColorAssignment[],
        colorPalette: IColorPalette,
    ): IColorAssignment[] {
        return measuresColorAssignment.map((mapItem, measureItemIndex) => {
            const measureGroup = findMeasureGroupInDimensions(dv.dimensions());

            if (!dv.isDerivedMeasure(measureGroup.items[measureItemIndex])) {
                return mapItem;
            }

            const masterMeasure = dv.masterMeasureForDerived(
                measureGroup.items[measureItemIndex].measureHeaderItem.localIdentifier,
            );
            if (!masterMeasure) {
                return mapItem;
            }
            const parentMeasureIndex = dv.measureIndex(masterMeasure.measure.localIdentifier);
            if (parentMeasureIndex > -1) {
                const sourceMeasureColor = measuresColorAssignment[parentMeasureIndex].color;
                return this.getDerivedMeasureColorAssignment(
                    sourceMeasureColor,
                    colorPalette,
                    measureItemIndex,
                    mapItem,
                );
            }
            return {
                ...mapItem,
                color: mapItem.color,
            };
        });
    }

    private getDerivedMeasureColorAssignment(
        sourceMeasureColor: IColor,
        colorPalette: IColorPalette,
        measureItemIndex: number,
        mapItem: IColorAssignment,
    ) {
        const rgbColor = isColorFromPalette(sourceMeasureColor)
            ? getColorByGuid(colorPalette, sourceMeasureColor.value, measureItemIndex)
            : sourceMeasureColor.value;
        return {
            ...mapItem,
            color: {
                type: "rgb" as RgbType,
                value: getLighterColorFromRGB(rgbColor, 0.6),
            },
        };
    }
}
