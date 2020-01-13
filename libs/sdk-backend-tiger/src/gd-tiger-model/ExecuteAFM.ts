// (C) 2019-2020 GoodData Corporation

export namespace ExecuteAFM {
    export interface IExecution {
        project: string;
        resultSpec?: IResultSpec;
        execution: IAfm;
    }

    export interface IAfm {
        attributes?: IAttribute[];
        measures?: IMeasure[];
        filters?: CompatibilityFilter[];
        // native totals not yet supported by NAS
        // nativeTotals?: INativeTotalItem[];
    }

    export interface IResultSpec {
        dimensions?: IDimension[];
        sorts?: SortItem[];
    }

    export interface IAttribute {
        localIdentifier: Identifier;
        displayForm: ObjQualifier;
        alias?: string;
    }

    export interface IMeasure {
        localIdentifier: Identifier;
        definition: MeasureDefinition;
        alias?: string;
        format?: string;
    }

    export type MeasureDefinition =
        | ISimpleMeasureDefinition
        | IArithmeticMeasureDefinition
        | IPopMeasureDefinition
        | IPreviousPeriodMeasureDefinition;

    export interface ISimpleMeasureDefinition {
        measure: ISimpleMeasure;
    }

    export interface IArithmeticMeasureDefinition {
        arithmeticMeasure: IArithmeticMeasure;
    }

    export interface IPopMeasureDefinition {
        popMeasure: IPopMeasure;
    }

    export interface IPreviousPeriodMeasureDefinition {
        previousPeriodMeasure: IPreviousPeriodMeasure;
    }

    export type SimpleMeasureAggregation = "SUM" | "COUNT" | "AVG" | "MIN" | "MAX" | "MEDIAN" | "RUNSUM";

    export interface ISimpleMeasure {
        item: ObjQualifier;
        aggregation?: SimpleMeasureAggregation;
        filters?: FilterItem[];
        computeRatio?: boolean;
    }

    export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

    export interface IArithmeticMeasure {
        measureIdentifiers: ILocalIdentifierQualifier[];
        operator: ArithmeticMeasureOperator;
    }

    export interface IPopMeasure {
        measureIdentifier: ILocalIdentifierQualifier;
        popAttribute: ObjQualifier;
    }

    export interface IPreviousPeriodMeasure {
        measureIdentifier: ILocalIdentifierQualifier;
        dateDataSets: IPreviousPeriodDateDataSet[];
    }

    export interface IPreviousPeriodDateDataSet {
        dataSet: ObjQualifier;
        periodsAgo: number;
    }

    export type Identifier = string;
    export type ObjQualifier = IObjIdentifierQualifier;

    export interface IObjIdentifierQualifier {
        identifier: {
            id: string;
            type: string;
        };
    }

    export interface ILocalIdentifierQualifier {
        localIdentifier: string;
    }

    export type CompatibilityFilter = IExpressionFilter | FilterItem;
    export type FilterItem = DateFilterItem | AttributeFilterItem;
    export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;
    export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;

    export interface IAttributeElementsByValue {
        values: string[];
    }

    export type AttributeElements = string[] | IAttributeElementsByValue;

    export interface IPositiveAttributeFilter {
        positiveAttributeFilter: {
            displayForm: ObjQualifier;
            in: AttributeElements;
        };
    }

    export interface INegativeAttributeFilter {
        negativeAttributeFilter: {
            displayForm: ObjQualifier;
            notIn: AttributeElements;
        };
    }

    export interface IAbsoluteDateFilter {
        absoluteDateFilter: {
            dataSet: ObjQualifier;
            from: string;
            to: string;
        };
    }

    export interface IRelativeDateFilter {
        relativeDateFilter: {
            dataSet: ObjQualifier;
            granularity: string;
            from: number;
            to: number;
        };
    }

    // Might be removed, as we don't know if expression filter is needed
    export interface IExpressionFilter {
        value: string;
    }

    export interface ITotalItem {
        measureIdentifier: ILocalIdentifierQualifier;
        type: TotalType;
        attributeIdentifier: ILocalIdentifierQualifier;
    }

    export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

    export interface INativeTotalItem {
        measureIdentifier: ILocalIdentifierQualifier;
        attributeIdentifiers: ILocalIdentifierQualifier[];
    }

    export interface IDimension {
        itemIdentifiers: Identifier[];
        totals?: ITotalItem[];
    }

    export type SortItem = IAttributeSortItem | IMeasureSortItem;
    export type SortDirection = "asc" | "desc";

    export interface IAttributeSortItem {
        attributeSortItem: {
            direction: SortDirection;
            attributeIdentifier: ILocalIdentifierQualifier;
            aggregation?: "sum";
        };
    }

    export interface IMeasureSortItem {
        measureSortItem: {
            direction: SortDirection;
            locators: LocatorItem[];
        };
    }

    export type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

    export interface IAttributeLocatorItem {
        attributeLocatorItem: {
            attributeIdentifier: ILocalIdentifierQualifier;
            element: string;
        };
    }

    export interface IMeasureLocatorItem {
        measureLocatorItem: {
            measureIdentifier: ILocalIdentifierQualifier;
        };
    }
}
