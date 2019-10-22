// (C) 2019 GoodData Corporation

import invariant from "ts-invariant";
import { Identifier } from "./index";
import { isTotal, ITotal } from "./totals";
import isEmpty = require("lodash/isEmpty");

/**
 * Dimensions specify how to organize the results of an execution in a data view. Imagine an attribute in columns vs. rows.
 * Each dimension requires the itemIdentifiers property, which is an array of items. These items could be attributes' localIdentifiers
 * or a special 'measureGroup' identifier.
 *
 * The 'measureGroup' can be used to specify that all measures in the execution definition should be
 * included in the dimension.
 *
 * @public
 */
export interface IDimension {
    /**
     * List of localIdentifier's of attribute to put in this dimension.
     */
    itemIdentifiers: Identifier[];

    /**
     * List of totals to include in this dimension.
     */
    totals?: ITotal[];
}

/**
 * Measure Group is a pseudo-identifier which can be used in an execution dimension and indicates
 * that this dimension MUST contain all the measures.
 *
 * @public
 */
export const MeasureGroupIdentifier = "measureGroup";

const isMeasureGroupIdentifier = (itemOrTotal: DimensionItem) => itemOrTotal === MeasureGroupIdentifier;

//
// Type guards
//

/**
 * Type guard checking whether object is of IDimension type.
 *
 * @public
 */
export function isDimension(obj: any): obj is IDimension {
    return !isEmpty(obj) && (obj as IDimension).itemIdentifiers !== undefined;
}

//
// Public functions
//

/**
 * Gets totals defined in the provided dimension
 *
 * @param dim - dimension to work with, may be undefined == empty totals will be returned
 * @returns totals in the dimension or empty array if none
 * @public
 */
export function dimensionTotals(dim: IDimension): ITotal[] {
    return dim && dim.totals ? dim.totals : [];
}

/**
 * Creates a new dimension which has same items as the provided dimension but different totals.
 *
 * @param dim - dimension to inherit item identifiers from
 * @param totals - totals to have in the new dimension
 * @returns new dimension
 * @public
 */
export function dimensionSetTotals(dim: IDimension, totals: ITotal[] = []): IDimension {
    const totalsProp = !isEmpty(totals) ? { totals } : {};

    return {
        itemIdentifiers: dim.itemIdentifiers,
        ...totalsProp,
    };
}

/**
 * Defines union of items that can be placed into a dimension.
 *
 * @public
 */
export type DimensionItem = Identifier | ITotal;

/**
 * Creates new two dimensional specification where each dimension will have the provided set of
 * identifiers.
 *
 * The 'measureGroup' identifier MAY be specified in only one of the dimensions.
 *
 * @param dim1Input - items to put into the first dimension, this can be item identifiers or totals
 * @param dim2Input - items to put into the second dimension, this can be item identifiers or totals
 * @returns array with exactly two dimensions
 * @public
 */
export function newTwoDimensional(dim1Input: DimensionItem[], dim2Input: DimensionItem[]): IDimension[] {
    const atMostOneMeasureGroup = !(
        dim1Input.find(isMeasureGroupIdentifier) && dim2Input.find(isMeasureGroupIdentifier)
    );

    invariant(
        atMostOneMeasureGroup,
        "The 'measureGroup' identifier must only be specified in one dimension.",
    );

    return [newDimension(dim1Input), newDimension(dim2Input)];
}

type CategorizedIdAndTotal = {
    ids: Identifier[];
    totals: ITotal[];
};

/**
 * Creates new single-dimensional specification where the dimension will have the provided set of identifiers.
 *
 * @param items - allows for mix of item identifiers and total definitions to have in the new dimension
 * @param totals - additional totals to add to the dimension
 * @returns single dimension
 * @public
 */
export function newDimension(items: DimensionItem[] = [], totals: ITotal[] = []): IDimension {
    const input: CategorizedIdAndTotal = items.reduce(
        (acc: CategorizedIdAndTotal, value: string | ITotal) => {
            if (isTotal(value)) {
                acc.totals.push(value);
            } else {
                acc.ids.push(value);
            }
            return acc;
        },
        { ids: [], totals: [] },
    );

    input.totals.push(...totals);
    const totalsProp = !isEmpty(input.totals) ? { totals: input.totals } : {};

    return {
        itemIdentifiers: input.ids,
        ...totalsProp,
    };
}
