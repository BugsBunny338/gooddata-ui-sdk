// (C) 2019-2020 GoodData Corporation
import {
    AttributeOrMeasure,
    IBucket,
    IDimension,
    IFilter,
    IInsightDefinition,
    SortItem,
    IExecutionDefinition,
    DimensionGenerator,
    defWithDimensions,
    newDefForItems,
    defaultDimensionsGenerator,
    newDefForBuckets,
    newDefForInsight,
} from "@gooddata/sdk-model";
import { IExportConfig, IExportResult } from "./export";
import { DataValue, IDimensionDescriptor, IResultHeader } from "./results";

/**
 * Execution factory provides several methods to create a prepared execution from different types
 * of inputs.
 *
 * Note: the execution factory WILL perform extensive input validation to ensure that the created
 * instance of prepared execution is semantically correct.
 *
 * @public
 */
export interface IExecutionFactory {
    /**
     * Prepares a new execution for the provided execution definition.
     *
     * The contract is that the definition is taken and used in the prepared execution AS IS. Compared
     * to the other convenience methods, this method MUST NOT create prepared executions with automatically
     * generated dimensions.
     *
     * @param def - execution definition
     * @returns new prepareted execution
     */
    forDefinition(def: IExecutionDefinition): IPreparedExecution;

    /**
     * Prepares a new execution for a list of attributes and measures, optionally filtered using the
     * provided filters.
     *
     * The contract is that prepared executions created by this method MUST be executable and MUST come with
     * pre-filled dimensions greated using the `defaultDimensionsGenerator` provided by the
     * `@gooddata/sdk-model` package.
     *
     * @param items - list of attributes and measures, must not be empty
     * @param filters - list of filters, may not be provided
     */
    forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution;

    /**
     * Prepares a new execution for a list of buckets. Attributes and measures WILL be transferred to the
     * execution in natural order:
     *
     * - Order of items within a bucket is retained in the execution
     * - Items from first bucket appear before items from second bucket
     *
     * Or more specifically, given two buckets with items as [A1, A2, M1] and [A3, M2, M3], the resulting
     * prepared execution WILL have definition with attributes = [A1, A2, A3] and measures = [M1, M2, M3]
     *
     * The contract is that prepared executions created by this method MUST be executable and MUST come with
     * pre-filled dimensions greated using the `defaultDimensionsGenerator` provided by the
     * `@gooddata/sdk-model` package.
     *
     * @param buckets - list of buckets with attributes and measures, must be non empty, must have at least one attr or measure
     * @param filters - optional, may not be provided
     */
    forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution;

    /**
     * Prepares a new execution for the provided insight. Buckets with attributes and measures WILL be used
     * to obtain attributes and measures - the behavior WILL be same as in forBuckets() function. Filters, sort by
     * and totals in the insight WILL be included in the prepared execution.
     *
     * Additionally, an optional list of additional filters WILL be merged with the filters already defined in
     * the insight.
     *
     * The contract is that prepared executions created by this method MUST be executable and MUST come with
     * pre-filled dimensions greated using the `defaultDimensionsGenerator` provided by the
     * `@gooddata/sdk-model` package.
     *
     * @param insight - insight to create execution for, must have buckets which must have some attributes or measures in them
     * @param filters - optional, may not be provided
     */
    forInsight(insight: IInsightDefinition, filters?: IFilter[]): IPreparedExecution;

    /**
     * Prepares new execution for an insight specified by reference =\> a link. This function is asynchronous as
     * the insight WILL be retrieved from backend at this point.
     *
     * Execution prepared using this method MAY be realized using different backend API than the executions where
     * attributes and measures are provided 'freeform'. In return, this different backend API may provide additional
     * authorization guarantees - for instance the backend MAY only allow end user to execute these stored insights
     * and not do any 'freeform' execution.
     *
     * The contract is that prepared executions created by this method MUST be executable and MUST come with
     * pre-filled dimensions created using the `defaultDimensionsGenerator` provided by the
     * `@gooddata/sdk-model` package.
     *
     * @param uri - link to insight
     * @param filters - optional list of filters to merge with filters already defined in the insight
     */
    forInsightByRef(uri: string, filters?: IFilter[]): Promise<IPreparedExecution>;
}

/**
 * Abstract base class that can be extended to implement concrete execution factories for different
 * backend implementations.
 *
 * This class implements the convenience methods which do not need to change in implementations.
 *
 * @public
 */
export abstract class AbstractExecutionFactory implements IExecutionFactory {
    constructor(private readonly workspace: string) {}

    public abstract forDefinition(def: IExecutionDefinition): IPreparedExecution;
    public abstract forInsightByRef(uri: string, filters?: IFilter[]): Promise<IPreparedExecution>;

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForItems(this.workspace, items, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def);
    }

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForBuckets(this.workspace, buckets, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def);
    }

    public forInsight(insight: IInsightDefinition, filters?: IFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForInsight(this.workspace, insight, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def);
    }
}

/**
 * Prepared execution already knows what data to calculate and allows to specify how the data should be
 * sorted and shaped into dimensions.
 *
 * To this end, it provides several functions to customize sort items and dimensions. The prepared execution
 * is immutable and so all the customization functions WILL result in a new instance of prepared execution.
 *
 * The contract for creating these new instances is that the new prepared execution MUST be created using the
 * execution factory that created current execution.
 *
 * @public
 */
export interface IPreparedExecution {
    /**
     * Definition of the execution accumulated to so far.
     */
    readonly definition: IExecutionDefinition;

    /**
     * Changes sorting of the resulting data. Any sorting settings accumulated so far WILL be wiped out.
     *
     * @param items - items to sort by
     * @returns new execution with the updated sorts
     */
    withSorting(...items: SortItem[]): IPreparedExecution;

    /**
     * Configures dimensions of the resulting data. Any dimension settings accumulated so far WILL be wiped out.
     *
     * The realizations of analytical backend MAY impose constraints on the minimum and maximum number of dimensions.
     * This call WILL fail if the input dimensions do not match constraints imposed by the backend.
     *
     * @param dim - dimensions to set
     * @returns new execution with the updated dimensions
     */
    withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution;

    /**
     * Starts the execution.
     */
    execute(): Promise<IExecutionResult>;

    /**
     * Tests whether this execution and the other execution are the same.
     *
     * @param other - another execution
     */
    equals(other: IPreparedExecution): boolean;

    /**
     * Fingerprint of this prepared execution - this is effectivelly fingerprint of the execution
     * definition underlying this instance of Prepared Execution.
     */
    fingerprint(): string;
}

/**
 * Represents results of execution done with particular definition. Within the result is the description of the
 * shape of the data and methods to to obtain views on the data.
 *
 * @public
 */
export interface IExecutionResult {
    /**
     * Full definition of execution that yielded this result.
     */
    readonly definition: IExecutionDefinition;

    /**
     * Description of shape of the data.
     */
    readonly dimensions: IDimensionDescriptor[];

    /**
     * Asynchronously reads all data for this result into a single data view.
     *
     * @returns Promise of data view
     */
    readAll(): Promise<IDataView>;

    /**
     * Asynchronously reads a window of data for this result. The window is specified using
     * offset array and size array. The offsets specify coordinates where the view starts and
     * are zero-based. The sizes specify size of the window in each of the results dimension.
     *
     *
     * @param offset - coordinates where the window starts
     * @param size - size of the window in each of the dimensions
     * @returns Promise of data view
     */
    readWindow(offset: number[], size: number[]): Promise<IDataView>;

    /**
     * Transforms this execution result - changing the result sorting, dimensionality and available
     * totals is possible through transformation.
     *
     * It is strongly encouraged to use this function every time when data SHOULD remain the same and just
     * its sorting or dimensionality or totals MUST change. That is because since this intent of the caller
     * is known, the function can apply additional optimizations and obtain the updated result faster
     * compared to fully running the execution.
     *
     * Whether the reuse of the computed result actually happens depends on couple of factors:
     *
     * - Transformation is eligible: adding new native totals (roll-ups) necessitates full re-execution;
     *   all other types of changes (including adding other types of totals) are eligible for execution result reuse.
     *
     * - Backend capabilities: backend MAY NOT be able to natively reuse existing execution result. This is
     *   communicated by the canTransformExistingResult indicator.
     *
     * If the transformation is not eligible for result reuse or the backend is not capable of this optimization, then
     * a new execution WILL be done completely transparently for the caller.
     *
     * @returns new prepared execution with no sorts, dimensions or totals
     */
    transform(): IPreparedExecution;

    /**
     * Asynchronously exports all data in this result.
     *
     * @param options - customize how the result looks like (format etc)
     * @returns Promise of export result = uri of file with exported data
     */
    export(options: IExportConfig): Promise<IExportResult>;

    /**
     * Tests if this execution result is same as the other result.
     *
     * @param other - other result
     * @returns true if equal, false if not
     */
    equals(other: IExecutionResult): boolean;

    /**
     * Unique fingerprint of the execution result. The fingerprint is influenced by both data included in
     * the result and its dimensionality, sorting and totals.
     *
     * Thus, two results with the same data and same execution definition will have the same fingerprint.
     */
    fingerprint(): string;
}

/**
 * A view on the calculated data.
 *
 * @remarks
 *
 * See also the `DataViewFacade`. This wrapper on top of this raw IDataView can be used to work
 * with the data in a way more convenient fashion.
 *
 * @public
 */
export interface IDataView {
    /**
     * Coordinates of where this data view starts. One coordinate per result dimension.
     */
    readonly offset: number[];

    /**
     * Count of data in each dimension.
     */
    readonly count: number[];

    /**
     * Total size of data in each dimension.
     */
    readonly totalCount: number[];

    /**
     * Headers are metadata for the data in this view. There are headers for each dimension and in
     * each dimension headers are further sliced by the attribute or measure or total to which the data
     * belongs.
     *
     * Thus:
     *
     * - Top array contains 0 to N per-dimension arrays, one for each requested dimension (if any)
     * - The per-dimension arrays then contain per-slice array, one for each attribute or measure in the dimension
     * - The per-slice-array then contains the actual result header which includes information such as attribute element
     *   or measure name
     */
    readonly headerItems: IResultHeader[][][];

    /**
     * The calculated data. Dimensionality of the data matches the dimensions requested at execution time.
     */
    readonly data: DataValue[][] | DataValue[];

    /**
     * Grand totals included in this data view. Grand totals are included for each dimension; within each
     * dimension there is one entry per requested total and for each requested total there are list of values.
     *
     * Thus:
     *
     * - Top array contains 0 to N per-dimension arrays
     * - Each per-dimension array contains one per-total entry for each requested total
     * - Each per-total entry contains array of calculated values, cardinality of this matches the cardinality
     *   of the data in the respective dimension.
     */
    readonly totals?: DataValue[][][];

    /**
     * Full definition of execution that computed data included in this DataView.
     */
    readonly definition: IExecutionDefinition;

    /**
     * Result of the execution that calculated data for this view.
     */
    readonly result: IExecutionResult;

    /**
     * Tests if this data view is same as the other data view.
     *
     * @param other - other data view
     * @returns true if equal, false if not
     */
    equals(other: IDataView): boolean;

    /**
     * Unique fingerprint of this data view - the fingerprint is influenced by the execution result and the
     * offset and limit of the data view.
     *
     * Thus, two data views on the same result, with same offset and limit will have the same fingerprint.
     */
    fingerprint(): string;
}
