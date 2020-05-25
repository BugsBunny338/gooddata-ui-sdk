// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { DateString, DateFilterGranularity } from "./extendedDateFilters";
import isEmpty from "lodash/isEmpty";
import { IDashboardObjectIdentity } from "./common";

/**
 * Date filter type - relative
 * @alpha
 */
export type RelativeType = "relative";

/**
 * Date filter type - absolute
 * @alpha
 */
export type AbsoluteType = "absolute";

/**
 * Date filter type - relative or absolute
 * @alpha
 */
export type DateFilterType = RelativeType | AbsoluteType;

/**
 * Attribute filter of the filter context
 * @alpha
 */
export interface IDashboardAttributeFilter {
    attributeFilter: {
        /**
         * Display form object ref
         */
        displayForm: ObjRef;

        /**
         * Is negative filter?
         */
        negativeSelection: boolean;

        /**
         * Selected attribute elements object refs
         */
        attributeElements: ObjRef[];
    };
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardAttributeFilter}.
 * @alpha
 */
export function isDashboardAttributeFilter(obj: any): obj is IDashboardAttributeFilter {
    return !isEmpty(obj) && !!(obj as IDashboardAttributeFilter).attributeFilter;
}

/**
 * Date filter of the filter context
 * @alpha
 */
export interface IDashboardDateFilter {
    dateFilter: {
        /**
         * Date filter type - relative or absolute
         */
        type: DateFilterType;

        /**
         * Date filter granularity
         */
        granularity: DateFilterGranularity;

        /**
         * Filter - from
         */
        from?: DateString | number;

        /**
         * Filter - to
         */
        to?: DateString | number;

        /**
         * DateDataSet object ref
         */
        dataSet?: ObjRef;

        /**
         * Date attribute object ref
         */
        attribute?: ObjRef;
    };
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardDateFilter}.
 * @alpha
 */
export function isDashboardDateFilter(obj: any): obj is IDashboardDateFilter {
    return !isEmpty(obj) && !!(obj as IDashboardDateFilter).dateFilter;
}

/**
 * Supported filter context items
 * @alpha
 */
export type FilterContextItem = IDashboardAttributeFilter | IDashboardDateFilter;

/**
 * Common filter context properties
 *
 * @alpha
 */
export interface IFilterContextBase {
    /**
     * Filter context title
     */
    readonly title: string;

    /**
     * Filter context description
     */
    readonly description: string;

    /**
     * Attribute or date filters
     */
    readonly filters: FilterContextItem[];
}

/**
 * Filter context definition represents modifier or created filter context
 *
 * @alpha
 */
export interface IFilterContextDefinition extends IFilterContextBase, Partial<IDashboardObjectIdentity> {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFilterContextDefinition}.
 * @alpha
 */
export function isFilterContextDefinition(obj: any): obj is IFilterContextDefinition {
    // Currently, we have no better way to distinguish between IFilterContext and ITempFilterContext
    return !isEmpty(obj) && !!(obj as IFilterContextDefinition).filters && !(obj as IFilterContext).ref;
}

/**
 * Filter context consists of configured attribute and date filters
 * (which could be applyied to the dashboard, widget alert, or scheduled email)
 *
 * @alpha
 */
export interface IFilterContext extends IFilterContextBase, IDashboardObjectIdentity {}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFilterContext}.
 * @alpha
 */
export function isFilterContext(obj: any): obj is IFilterContext {
    // Currently, we have no better way to distinguish between IFilterContext and ITempFilterContext
    return !isEmpty(obj) && !!(obj as IFilterContext).filters && !!(obj as IFilterContext).ref;
}

/**
 * Temporary filter context serves to override original dashboard filter context during the dashboard export
 *
 * @alpha
 */
export interface ITempFilterContext {
    /**
     * Filter context created time
     * YYYY-MM-DD HH:mm:ss
     */
    readonly created: string;

    /**
     * Attribute or date filters
     */
    readonly filters: FilterContextItem[];

    /**
     * Temp filter context ref
     */
    readonly ref: ObjRef;

    /**
     * Temp filter context uri
     */
    readonly uri: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ITempFilterContext}.
 * @alpha
 */
export function isTempFilterContext(obj: any): obj is ITempFilterContext {
    // Currently, we have no better way to distinguish between IFilterContext and ITempFilterContext
    return (
        !isEmpty(obj) &&
        !!(obj as ITempFilterContext).filters &&
        !(obj as IFilterContext).identifier &&
        !(obj as IFilterContext).title
    );
}

/**
 * Reference to a particular dashboard date filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 *
 * @alpha
 */
export interface IDashboardDateFilterReference {
    /**
     * Dashboard filter reference type
     */
    type: "dateFilterReference";

    /**
     * DataSet reference of the target date filter
     */
    dataSet: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardDateFilterReference}.
 * @alpha
 */
export function isDashboardDateFilterReference(obj: any): obj is IDashboardDateFilterReference {
    return !isEmpty(obj) && (obj as IDashboardDateFilterReference).type === "dateFilterReference";
}

/**
 * Reference to a particular dashboard attribute filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 *
 * @alpha
 */
export interface IDashboardAttributeFilterReference {
    /**
     * Dashboard filter reference type
     */
    type: "attributeFilterReference";

    /**
     * Attribute display form reference of the target attribute filter
     */
    displayForm: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardAttributeFilterReference}.
 * @alpha
 */
export function isDashboardAttributeFilterReference(obj: any): obj is IDashboardAttributeFilterReference {
    return !isEmpty(obj) && (obj as IDashboardAttributeFilterReference).type === "attributeFilterReference";
}

/**
 * Reference to a particular dashboard filter
 * This is commonly used to define filters to ignore
 * for the particular dashboard widget
 *
 * @alpha
 */
export type IDashboardFilterReference = IDashboardDateFilterReference | IDashboardAttributeFilterReference;
