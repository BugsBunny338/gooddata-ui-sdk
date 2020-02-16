// (C) 2019-2020 GoodData Corporation
import get = require("lodash/get");
import set = require("lodash/set");
import isEqual = require("lodash/isEqual");
import uniqBy = require("lodash/uniqBy");
import isEmpty = require("lodash/isEmpty");
import cloneDeep = require("lodash/cloneDeep");
import compact = require("lodash/compact");

import { IVisualizationProperties } from "../interfaces/Visualization";
import { IColorConfiguration, IColoredItem } from "../interfaces/Colors";
import { IMeasureDescriptor, isMeasureDescriptor, isResultAttributeHeader } from "@gooddata/sdk-backend-spi";
import { IColor, IColorMappingItem, isColorFromPalette, isRgbColor } from "@gooddata/sdk-model";
import { IColorAssignment, IMappingHeader } from "@gooddata/sdk-ui";
import { ColorUtils } from "@gooddata/sdk-ui-charts";

function getItemName(item: IColoredItem): string {
    let name = "";

    if (isMeasureDescriptor(item.mappingHeader)) {
        name = item.mappingHeader.measureHeaderItem.name;
    } else if (isResultAttributeHeader(item.mappingHeader)) {
        name = item.mappingHeader.attributeHeaderItem.name;
    }

    return name || "";
}

export function getSearchedItems(inputItems: IColoredItem[], searchString: string): IColoredItem[] {
    if (isEmpty(searchString)) {
        return inputItems;
    }
    return inputItems.filter((item: IColoredItem) => {
        const name = getItemName(item);
        return name.toLowerCase().includes(searchString.toLowerCase());
    });
}

export function getColoredInputItems(colors: IColorConfiguration): IColoredItem[] {
    let inputItems: IColoredItem[] = [];

    if (colors && colors.colorAssignments) {
        inputItems = colors.colorAssignments.map((assignmentItem: IColorAssignment, index: number) => {
            if (isColorFromPalette(assignmentItem.color)) {
                return {
                    colorItem: assignmentItem.color,
                    mappingHeader: assignmentItem.headerItem,
                    color: ColorUtils.getColorByGuid(colors.colorPalette, assignmentItem.color.value, index),
                };
            } else if (isRgbColor(assignmentItem.color)) {
                return {
                    colorItem: assignmentItem.color,
                    mappingHeader: assignmentItem.headerItem,
                    color: assignmentItem.color.value,
                };
            }
        });
    }

    return inputItems;
}

function getMeasureMappingIdentifier(item: IMeasureDescriptor): string {
    return item.measureHeaderItem.localIdentifier;
}

function mergeColorMappingToProperties(properties: IVisualizationProperties, id: string, color: IColor) {
    const colorMapping: IColorMappingItem[] = [
        {
            id,
            color,
        },
    ];

    const previousColorMapping = get(properties, ["controls", "colorMapping"]) || [];

    const mergedMapping = compact(uniqBy([...colorMapping, ...previousColorMapping], "id"));
    const newProperties = cloneDeep(properties);
    set(newProperties, "controls.colorMapping", mergedMapping);

    return newProperties;
}

export function getProperties(
    properties: IVisualizationProperties,
    item: IMappingHeader,
    color: IColor,
): IVisualizationProperties {
    if (isMeasureDescriptor(item)) {
        const id = getMeasureMappingIdentifier(item);
        const newProperties = mergeColorMappingToProperties(properties, id, color);

        return newProperties;
    } else if (isResultAttributeHeader(item)) {
        return mergeColorMappingToProperties(properties, item.attributeHeaderItem.uri, color);
    }

    return {};
}

export function getValidProperties(
    properties: IVisualizationProperties,
    colorAssignments: IColorAssignment[],
) {
    if (!properties || !properties.controls || !properties.controls.colorMapping) {
        return properties;
    }

    const reducedColorMapping = properties.controls.colorMapping.filter((mappingItem: IColorMappingItem) => {
        const { id } = mappingItem;
        const colorValue = mappingItem.color.value;

        const isMeasureInAssignment = colorAssignments.find((colorAssignment: IColorAssignment) => {
            if (isMeasureDescriptor(colorAssignment.headerItem)) {
                return (
                    colorAssignment.headerItem.measureHeaderItem.localIdentifier === id &&
                    isEqual(colorAssignment.color.value, colorValue)
                );
            }

            return false;
        });

        if (isMeasureInAssignment) {
            return true;
        }

        const isAttributeInAssignment = colorAssignments.find((colorAssignment: IColorAssignment) => {
            if (isResultAttributeHeader(colorAssignment.headerItem)) {
                return colorAssignment.headerItem.attributeHeaderItem.uri === id;
            }

            return false;
        });

        if (isAttributeInAssignment) {
            return true;
        }
    });

    return {
        ...properties,
        controls: {
            ...properties.controls,
            colorMapping: reducedColorMapping.length ? reducedColorMapping : null,
        },
    };
}
