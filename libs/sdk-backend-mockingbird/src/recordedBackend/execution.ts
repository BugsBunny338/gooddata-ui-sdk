// (C) 2019-2020 GoodData Corporation

import {
    AbstractExecutionFactory,
    DataValue,
    IDataView,
    IDimensionDescriptor,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IResultHeader,
    NoDataError,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    IFilter,
    SortItem,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { ExecutionRecording, RecordingIndex, ScenarioRecording } from "./types";
import flatMap = require("lodash/flatMap");

//
//
//

const DataViewPrefix = "dataView_";

/**
 * @internal
 */
export const DataViewAll = `${DataViewPrefix}all`;

/**
 * @internal
 */
export const dataViewWindow = (offset: number[], size: number[]) =>
    `${DataViewPrefix}${dataViewWindowId(offset, size)}`;

const dataViewWindowId = (offset: number[], size: number[]) => `o${offset.join("_")}s${size.join("_")}`;

/**
 * @internal
 */
export const DataViewFirstPage = dataViewWindow([0, 0], [100, 1000]);

//
//
//

/**
 * @internal
 */
export class RecordedExecutionFactory extends AbstractExecutionFactory {
    constructor(private readonly recordings: RecordingIndex, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return recordedPreparedExecution(def, this, this.recordings);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotSupported("not yet supported");
    }
}

function recordedExecutionKey(defOrFingerprint: IExecutionDefinition | string): string {
    const fp = typeof defOrFingerprint === "string" ? defOrFingerprint : defFingerprint(defOrFingerprint);

    return `fp_${fp}`;
}

function recordedPreparedExecution(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    recordings: RecordingIndex = {},
): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return executionFactory.forDefinition(defWithDimensions(definition, ...dim));
        },
        withSorting(...items: SortItem[]): IPreparedExecution {
            return executionFactory.forDefinition(defWithSorting(definition, items));
        },
        execute(): Promise<IExecutionResult> {
            return new Promise((resolve, reject) => {
                const key = recordedExecutionKey(fp);
                const recording = recordings.executions && recordings.executions[key];

                if (!recording) {
                    reject(new NoDataError("recording was not found"));
                } else {
                    resolve(new RecordedExecutionResult(definition, executionFactory, recording));
                }
            });
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return fp === other.fingerprint();
        },
    };
}

class RecordedExecutionResult implements IExecutionResult {
    public readonly dimensions: IDimensionDescriptor[];
    private readonly _fp: string;

    constructor(
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
        private readonly recording: ExecutionRecording,
    ) {
        this.dimensions = this.recording.executionResult.dimensions as IDimensionDescriptor[];
        this._fp = defFingerprint(this.definition) + "/recordedResult";
    }

    public export = (_options: IExportConfig): Promise<IExportResult> => {
        throw new NotSupported("recorded backend does not support exports");
    };

    public readAll = (): Promise<IDataView> => {
        const allData = this.recording[DataViewAll];

        if (!allData) {
            return Promise.reject(new NoDataError("there is no execution recording that contains all data"));
        }

        return Promise.resolve(new RecordedDataView(this, this.definition, allData));
    };

    public readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        const windowDataId = `${DataViewPrefix}${dataViewWindowId(offset, size)}`;
        const windowData = this.recording[windowDataId];

        if (!windowData) {
            return Promise.reject(new NoDataError("there is no execution recording for requested window"));
        }

        return Promise.resolve(new RecordedDataView(this, this.definition, windowData));
    };

    public transform = (): IPreparedExecution => {
        return this.executionFactory.forDefinition(this.definition);
    };

    public equals = (other: IExecutionResult): boolean => {
        return this.fingerprint() === other.fingerprint();
    };

    public fingerprint = (): string => {
        return this._fp;
    };
}

class RecordedDataView implements IDataView {
    public readonly data: DataValue[][] | DataValue[];
    public readonly headerItems: IResultHeader[][][];
    public readonly count: number[];
    public readonly offset: number[];
    public readonly totalCount: number[];
    public readonly totals: DataValue[][][];

    private readonly _fp: string;

    constructor(
        public readonly result: IExecutionResult,
        public readonly definition: IExecutionDefinition,
        recordedDataView: any,
    ) {
        this.data = recordedDataView.data;
        this.headerItems = recordedDataView.headerItems;
        this.totals = recordedDataView.totals;
        this.count = recordedDataView.count;
        this.offset = recordedDataView.offset;
        this.totalCount = recordedDataView.totalCount;

        this._fp = `${defFingerprint(this.definition)}/dataView/${this.offset.join(",")}_${this.count.join(
            ",",
        )}`;
    }

    public equals = (other: IDataView): boolean => {
        return this.fingerprint() === other.fingerprint();
    };

    public fingerprint = (): string => {
        return this._fp;
    };
}

//
//
//

/**
 * Creates a new data view facade for the provided recording. If the recording contains multiple sets of dataViews
 * (e.g. for different windows etc), then it is possible to provide dataViewId to look up the particular view. By default,
 * the data view with all data is wrapped in the facade.
 *
 * The returned view is linked to a valid result; calling transform() returns an instance of prepared execution which
 * is executable as-is (and leads to the same result). However any modification to this prepared execution would
 * lead a NO_DATA errors (because that different data is not included in the index)
 *
 * @remarks see {@link dataViewWindow}
 *
 * @param recording - recording (as obtained from the index, typically using the Scenario mapping)
 * @param dataViewId - optionally identifier of the data view; defaults to view with all data
 * @internal
 */
export function recordedDataView(recording: ScenarioRecording, dataViewId: string = DataViewAll): IDataView {
    const { execution, scenarioIndex } = recording;
    const scenario = execution.scenarios?.[scenarioIndex];

    invariant(
        scenario,
        "unable to find test scenario recording; this is most likely because of invalid/stale recording index. please refresh recordings and rebuild.",
    );

    const definition = { ...execution.definition, buckets: scenario.buckets };

    /*
     * construct ad-hoc recording index that contains input recording.
     *
     * this enables limited facade => result => transform => exec flow.
     */
    const recordingKey = recordedExecutionKey(definition);
    const adHocIndex: RecordingIndex = { executions: {} };
    adHocIndex.executions![recordingKey] = execution;

    const factory = new RecordedExecutionFactory(adHocIndex, "testWorkspace");
    const result = new RecordedExecutionResult(definition, factory, execution);
    const data = execution[dataViewId];

    invariant(data, `data for view ${dataViewId} could not be found in the recording`);

    return new RecordedDataView(result, definition, data);
}

function expandRecordingToDataViews(recording: ExecutionRecording): NamedDataView[] {
    if (!recording.scenarios) {
        return [];
    }

    if (!recording[DataViewAll]) {
        return [];
    }

    return recording.scenarios.map((s, scenarioIndex) => {
        const name = `${s.vis} - ${s.scenario}`;
        const dataView = recordedDataView({ scenarioIndex, execution: recording });

        return {
            name,
            dataView,
        };
    });
}

export type NamedDataView = {
    name: string;
    dataView: IDataView;
};

/**
 * Given recording index with executions, this function will return named DataView instances for executions
 * that match the following criteria:
 *
 * 1.  Executions specify test scenarios to which they belong - the test scenarios are used to obtain
 *     name of the data view
 *
 * 2.  Executions contain `DataViewAll` recording = all data for the test scenario.
 *
 * @param recordings - recording index (as created by mock-handling tooling)
 * @returns list of named data views; names are derived from test scenarios to which the data views belong
 * @internal
 */
export function recordedDataViews(recordings: RecordingIndex): NamedDataView[] {
    if (!recordings.executions) {
        return [];
    }

    const executionRecordings = Object.values(recordings.executions);

    return flatMap(executionRecordings, expandRecordingToDataViews);
}
