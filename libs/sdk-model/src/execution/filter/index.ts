// (C) 2019-2020 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import invariant from "ts-invariant";
import { ObjRef, ObjRefInScope } from "../../objRef";

/**
 * Attribute elements specified by their URI.
 *
 * NOTE: using attribute element URIs is discouraged - the URIs contain identifier of a workspace and thus
 * bind the attribute element to that workspace. The analytical application built using URIs will not work
 * across workspaces.
 *
 * @public
 */
export interface IAttributeElementsByRef {
    uris: string[];
}

/**
 * Attribute elements specified by their textual value.
 *
 * @public
 */
export interface IAttributeElementsByValue {
    values: string[];
}

/**
 * Attribute elements are used in positive and negative attribute filters. They can be specified either
 * using URI (discouraged) or using textual values of the attribute elements.
 *
 * @public
 */
export type IAttributeElements = IAttributeElementsByRef | IAttributeElementsByValue;

/**
 * Positive attribute filter essentially adds an `IN <set>` condition to the execution on the backend. When
 * the condition is applied on attribute display form which is included in execution, it essentially limits the
 * attribute elements that will be returned in the results: only those elements that are in the provided list
 * will be returned.
 *
 * The filter can be specified even for attributes that are not included in the execution - such a filter then
 * MAY influence the results of the execution indirectly: if the execution definition specifies MAQL measures that
 * use the filtered attribute.
 *
 * @public
 */
export interface IPositiveAttributeFilter {
    positiveAttributeFilter: {
        /**
         * Display form whose attribute elements are included in the 'in' list.
         */
        displayForm: ObjRef;
        in: IAttributeElements;
    };
}

/**
 * Negative attribute filter essentially adds an `NOT IN <set>` condition to the execution on the backend. When
 * the condition is applied on attribute display form which is included in execution, it essentially limits the
 * attribute elements that will be returned in the results: only those elements that ARE NOT in the provided list
 * will be returned.
 *
 * The filter can be specified even for attributes that are not included in the execution - such a filter then
 * MAY influence the results of the execution indirectly: if the execution definition specifies MAQL measures that
 * use the filtered attribute.
 *
 * @public
 */
export interface INegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjRef;
        notIn: IAttributeElements;
    };
}

/**
 * Filters results to an absolute date range - from one fixed date to another.
 *
 * @public
 */
export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        /**
         * Date data set for filtering
         */
        dataSet: ObjRef;

        /**
         * Start date (including): this is in format 'YYYY-MM-DD'
         */
        from: string;

        /**
         * End date (including): this is in format 'YYYY-MM-DD'
         */
        to: string;
    };
}

/**
 * Filters results to a relative date range. The relative filtering is always done on some granularity - this specifies
 * the units in the 'from' and 'to' fields.
 *
 * {@link DateGranularity}
 * @public
 */
export interface IRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjRef;
        granularity: string;
        from: number;
        to: number;
    };
}

/**
 * Defines date data set granularities that can be used in relative date filter.
 *
 * @public
 */
export const DateGranularity = {
    date: "GDC.time.date",
    week: "GDC.time.week_us",
    month: "GDC.time.month",
    quarter: "GDC.time.quarter",
    year: "GDC.time.year",
};

/**
 * Attribute filters limit results of execution to data pertaining to attributes that are or are not specified
 * by the filters.
 *
 * @public
 */
export type IAttributeFilter = IPositiveAttributeFilter | INegativeAttributeFilter;

/**
 * Date filters limit the range of results to data within relative or absolute date range.
 *
 * @public
 */
export type IDateFilter = IRelativeDateFilter | IAbsoluteDateFilter;

/**
 * @public
 */
export type ComparisonConditionOperator =
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "EQUAL_TO"
    | "NOT_EQUAL_TO";

/**
 * @public
 */
export interface IComparisonCondition {
    comparison: {
        operator: ComparisonConditionOperator;
        value: number;
        treatNullValuesAs?: number;
    };
}

/**
 * @public
 */
export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

/**
 * @public
 */
export interface IRangeCondition {
    range: {
        operator: RangeConditionOperator;
        from: number;
        to: number;
        treatNullValuesAs?: number;
    };
}

/**
 * @public
 */
export type MeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

/**
 * @public
 */
export interface IMeasureValueFilter {
    measureValueFilter: {
        measure: ObjRefInScope;
        condition?: MeasureValueFilterCondition;
    };
}

/**
 * All possible filters.
 *
 * @public
 */
export type IFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter
    | IMeasureValueFilter;

/**
 * All possible filters that can be specified for a simple measure.
 *
 * @public
 */
export type IMeasureFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;

//
// Type guards
//

/**
 * Type guard checking whether the provided object is a positive attribute filter.
 *
 * @public
 */
export function isPositiveAttributeFilter(obj: any): obj is IPositiveAttributeFilter {
    return !isEmpty(obj) && (obj as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a negative attribute filter.
 *
 * @public
 */
export function isNegativeAttributeFilter(obj: any): obj is INegativeAttributeFilter {
    return !isEmpty(obj) && (obj as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is an absolute date filter.
 *
 * @public
 */
export function isAbsoluteDateFilter(obj: any): obj is IAbsoluteDateFilter {
    return !isEmpty(obj) && (obj as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a relative date filter.
 *
 * @public
 */
export function isRelativeDateFilter(obj: any): obj is IRelativeDateFilter {
    return !isEmpty(obj) && (obj as IRelativeDateFilter).relativeDateFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is an attribute filter.
 *
 * @public
 */
export function isAttributeFilter(obj: any): obj is IAttributeFilter {
    return isPositiveAttributeFilter(obj) || isNegativeAttributeFilter(obj);
}

/**
 * Type guard checking whether the provided object is a date filter.
 *
 * @public
 */
export function isDateFilter(obj: any): obj is IDateFilter {
    return isRelativeDateFilter(obj) || isAbsoluteDateFilter(obj);
}

/**
 * Type guard checking whether the provided object is a measure value filter.
 *
 * @public
 */
export function isMeasureValueFilter(obj: any): obj is IMeasureValueFilter {
    return !isEmpty(obj) && (obj as IMeasureValueFilter).measureValueFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a measure value filter's comparison condition.
 *
 * @public
 */
export function isComparisonCondition(obj: any): obj is IComparisonCondition {
    return !isEmpty(obj) && (obj as IComparisonCondition).comparison !== undefined;
}

/**
 * Type guard checking whether the provided operator is a measure value filter's comparison operator.
 *
 * @public
 */
export function isComparisonConditionOperator(obj: any): obj is ComparisonConditionOperator {
    return (
        obj === "GREATER_THAN" ||
        obj === "GREATER_THAN_OR_EQUAL_TO" ||
        obj === "LESS_THAN" ||
        obj === "LESS_THAN_OR_EQUAL_TO" ||
        obj === "EQUAL_TO" ||
        obj === "NOT_EQUAL_TO"
    );
}

/**
 * Type guard checking whether the provided object is a measure value filter's range condition.
 *
 * @public
 */
export function isRangeCondition(obj: any): obj is IRangeCondition {
    return !isEmpty(obj) && (obj as IRangeCondition).range !== undefined;
}

/**
 * Type guard checking whether the provided object is a measure value filter's range condition operator.
 *
 * @public
 */
export function isRangeConditionOperator(obj: any): obj is RangeConditionOperator {
    return obj === "BETWEEN" || obj === "NOT_BETWEEN";
}

/**
 * Type guard checking whether the provided object is list of attribute elements specified by URI reference.
 *
 * @public
 */
export function isAttributeElementsByRef(obj: any): obj is IAttributeElementsByRef {
    return !isEmpty(obj) && (obj as IAttributeElementsByRef).uris !== undefined;
}

/**
 * Type guard checking whether the provided object is list of attribute elements specified by their text value.
 *
 * @public
 */
export function isAttributeElementsByValue(obj: any): obj is IAttributeElementsByValue {
    return !isEmpty(obj) && (obj as IAttributeElementsByValue).values !== undefined;
}

//
// Functions
//

/**
 * Tests whether the provided attribute element does not specify any attribute elements.
 *
 * @param filter - attribute filter to test
 * @returns true if empty = no attribute elements
 * @public
 */
export function filterIsEmpty(filter: IAttributeFilter): boolean {
    invariant(filter, "filter must be specified");

    if (isPositiveAttributeFilter(filter)) {
        return attributeElementsIsEmpty(filter.positiveAttributeFilter.in);
    }

    return attributeElementsIsEmpty(filter.negativeAttributeFilter.notIn);
}

/**
 * Tests whether the attribute elements object is empty.
 *
 * @param attributeElements - object to test
 * @returns true if empty = attribute elements not specified in any way (URI or value)
 * @internal
 */
export function attributeElementsIsEmpty(attributeElements: IAttributeElements): boolean {
    invariant(attributeElements, "attribute elements must be specified");

    if (isAttributeElementsByRef(attributeElements)) {
        return isEmpty(attributeElements.uris);
    }

    return isEmpty(attributeElements.values);
}

/**
 * Gets attribute elements specified on the attribute filter.
 *
 * @param filter - attribute filter to work with
 * @returns attribute elements, undefined if not available
 * @public
 */
export function filterAttributeElements(
    filter: IPositiveAttributeFilter | INegativeAttributeFilter,
): IAttributeElements;
/**
 * Gets attribute elements specified on a filter. If the provided filter is not an attribute filter, then
 * undefined is returned
 *
 * @param filter - filter to work with
 * @returns attribute elements, undefined if not available
 * @public
 */
export function filterAttributeElements(filter: IFilter): IAttributeElements | undefined;
export function filterAttributeElements(filter: IFilter): IAttributeElements | undefined {
    invariant(filter, "attribute elements must be specified");

    if (!isAttributeFilter(filter)) {
        return undefined;
    }

    return isPositiveAttributeFilter(filter)
        ? filter.positiveAttributeFilter.in
        : filter.negativeAttributeFilter.notIn;
}

/**
 * Gets reference to object being used for filtering. For attribute filters, this will be reference to the display
 * form. For date filters this will be reference to the data set.
 *
 * @param filter - filter to work with
 * @returns reference to object used for filtering (display form for attr filters, data set for date filters)
 * @public
 */
export function filterObjRef(
    filter: IAbsoluteDateFilter | IRelativeDateFilter | IPositiveAttributeFilter | INegativeAttributeFilter,
): ObjRef;
/**
 * Gets reference to object being used for filtering. For attribute filters, this will be reference to the display
 * form. For date filters this will be reference to the data set. For measure value filter, this will be undefined.
 *
 * @param filter - filter to work with
 * @returns reference to object used for filtering (display form for attr filters, data set for date filters), undefined
 *  for measure value filters
 * @public
 */
export function filterObjRef(filter: IFilter): ObjRef | undefined;
export function filterObjRef(filter: IFilter): ObjRef | undefined {
    invariant(filter, "filter must be specified");

    if (isPositiveAttributeFilter(filter)) {
        return filter.positiveAttributeFilter.displayForm;
    }
    if (isNegativeAttributeFilter(filter)) {
        return filter.negativeAttributeFilter.displayForm;
    }
    if (isAbsoluteDateFilter(filter)) {
        return filter.absoluteDateFilter.dataSet;
    }
    if (isRelativeDateFilter(filter)) {
        return filter.relativeDateFilter.dataSet;
    }
    return undefined;
}

/**
 * Represents values of an absolute filter.
 *
 * @public
 */
export interface IAbsoluteDateFilterValues {
    from: string;
    to: string;
}

/**
 * Gets effective values of an absolute date filter.
 *
 * @param filter - date filter to work with
 * @returns filter values
 * @public
 */
export function absoluteDateFilterValues(filter: IAbsoluteDateFilter): IAbsoluteDateFilterValues {
    invariant(filter, "filter must not be undefined");

    return {
        from: filter.absoluteDateFilter.from,
        to: filter.absoluteDateFilter.to,
    };
}

/**
 * Represents values of a relative filter.
 *
 * @public
 */
export interface IRelativeDateFilterValues {
    from: number;
    to: number;
    granularity: string;
}

/**
 * Gets effective values of a relative date filter.
 *
 * @param filter - date filter to work with
 * @returns filter values
 * @public
 */
export function relativeDateFilterValues(filter: IRelativeDateFilter): IRelativeDateFilterValues {
    invariant(filter, "filter must not be undefined");

    return {
        from: filter.relativeDateFilter.from,
        to: filter.relativeDateFilter.to,
        granularity: filter.relativeDateFilter.granularity,
    };
}

/**
 * Gets measure value filter measure.
 * @param filter - measure value filter to work with
 * @returns filter measure
 * @public
 */
export function measureValueFilterMeasure(filter: IMeasureValueFilter): ObjRefInScope {
    invariant(filter, "filter must not be undefined");

    return filter.measureValueFilter.measure;
}

/**
 * Gets measure value filter condition.
 * @param filter - measure value filter to work with
 * @returns filter condition
 * @public
 */
export function measureValueFilterCondition(
    filter: IMeasureValueFilter,
): MeasureValueFilterCondition | undefined {
    invariant(filter, "filter must not be undefined");

    return filter.measureValueFilter.condition;
}

/**
 * Gets operator used in measure value filter condition.
 *
 * @param filter - filter to get operator from
 * @returns undefined if no condition in the filter
 * @public
 */
export function measureValueFilterOperator(
    filter: IMeasureValueFilter,
): ComparisonConditionOperator | RangeConditionOperator | undefined {
    invariant(filter, "filter must not be undefined");

    if (isComparisonCondition(filter.measureValueFilter.condition)) {
        return filter.measureValueFilter.condition.comparison.operator;
    } else if (isRangeCondition(filter.measureValueFilter.condition)) {
        return filter.measureValueFilter.condition.range.operator;
    }

    return;
}
