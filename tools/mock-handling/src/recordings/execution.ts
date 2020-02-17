// (C) 2007-2020 GoodData Corporation

import { defFingerprint, IExecutionDefinition, IBucket } from "@gooddata/sdk-model";
import { IAnalyticalBackend, IDataView, IExecutionResult } from "@gooddata/sdk-backend-spi";
import * as fs from "fs";
import * as path from "path";
import { logWarn } from "../cli/loggers";
import { IRecording, readJsonSync, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common";
import isArray = require("lodash/isArray");
import isEmpty = require("lodash/isEmpty");
import isObject = require("lodash/isObject");
import pickBy = require("lodash/pickBy");

//
// internal constants & types
//

const DataViewRequestsFile = "requests.json";
const ScenariosFile = "scenarios.json";
const ExecutionResultFile = "executionResult.json";
const DataViewAllFile = "dataView_all.json";
const DataViewWindowFile = (win: RequestedWindow) => `dataView_${dataViewWindowId(win)}.json`;
const dataViewWindowId = (win: RequestedWindow) => `o${win.offset.join("_")}s${win.size.join("_")}`;
const DefaultDataViewRequests: DataViewRequests = {
    allData: true,
};
/**
 * Properties of execution result to serialize into the recording; everything else is functions or derivable / provided at runtime
 */
const ExecutionResultPropsToSerialize: Array<keyof IExecutionResult> = ["dimensions"];
/**
 * Properties of data view to serialize into the recording; everything else is functions or derivable / provided at runtime
 */
const DataViewPropsToSerialize: Array<keyof IDataView> = [
    "data",
    "headerItems",
    "totals",
    "count",
    "offset",
    "totalCount",
];

type DataViewRequests = {
    allData?: boolean;
    windows?: RequestedWindow[];
};

type RequestedWindow = {
    offset: number[];
    size: number[];
};

type DataViewFiles = {
    [filename: string]: RequestedWindow | "all";
};

//
// loading and verifying data from filesystem
//

function loadDefinition(directory: string): [IExecutionDefinition, string] {
    const fingerprint = path.basename(directory);
    const definition = readJsonSync(path.join(directory, ExecutionDefinitionFile)) as IExecutionDefinition;
    const calculatedFingerprint = defFingerprint(definition);

    if (calculatedFingerprint !== fingerprint) {
        logWarn(`The actual fingerprint ('${calculatedFingerprint}') of the execution definition stored in ${directory} does not match the directory in which it is stored. 
        If you created this definition manually then you do not have to worry about this warning. If this definition is supposed to be created
        by automation (such as the populate-ref scripts) then it indicates manual tampering.`);
    }

    return [definition, calculatedFingerprint];
}

// TODO: replace these weak validations with proper json-schema validation
function loadScenarios(directory: string): ScenarioDescriptor[] {
    const scenariosFile = path.join(directory, ScenariosFile);

    if (!fs.existsSync(scenariosFile)) {
        return [];
    }

    try {
        const scenarios = readJsonSync(scenariosFile);

        if (!isArray(scenarios)) {
            logWarn(
                `The ${ScenariosFile} in ${directory} does not contain JSON array with scenario metadata. Proceeding without scenarios - they will not be included for this particular recording. `,
            );

            return [];
        }

        const validScenarios = scenarios.filter(
            s => s.vis !== undefined && s.scenario !== undefined,
        ) as ScenarioDescriptor[];

        if (validScenarios.length !== scenarios.length) {
            logWarn(
                `The ${ScenariosFile} in ${directory} does not contain valid scenario metadata. Some or even all metadata have invalid shape. This comes as object with 'vis' and 'scenario' string properties. Proceeding without scenarios - they will not be included for this particular recording.`,
            );
        }

        return validScenarios;
    } catch (e) {
        logWarn(
            `Unable to read or parse ${ScenariosFile} in ${directory}: ${e}; it is likely that the file is malformed. It should contain JSON with array of {vis, scenario} objects. Proceeding without scenarios - they will not be included for this particular recording.`,
        );

        return [];
    }
}

// TODO: replace these weak validations with proper json-schema validation
function loadDataViewRequests(directory: string): DataViewRequests {
    const requestsFile = path.join(directory, DataViewRequestsFile);

    if (!fs.existsSync(requestsFile)) {
        return DefaultDataViewRequests;
    }

    try {
        const requests = readJsonSync(requestsFile) as DataViewRequests;

        if (!isObject(requests) || (requests.allData === undefined && requests.windows === undefined)) {
            logWarn(
                `The ${DataViewRequestsFile} in ${directory} does not contain valid data view request definitions. It should contain JSON with object with allData: boolean and/or windows: [{offset, size}]. Proceeding with default: getting all data.`,
            );

            return DefaultDataViewRequests;
        }

        // feeling lucky.. the file may still be messed up
        return requests;
    } catch (e) {
        logWarn(
            `Unable to read or parse ${DataViewRequestsFile} in ${directory}: ${e}; it is likely that the file is malformed. It should contain JSON with object with allData: boolean and/or windows: [{offset, size}]. Proceeding with default: getting all data.`,
        );

        return DefaultDataViewRequests;
    }
}

//
// Public API
//

export const ExecutionDefinitionFile = "definition.json";

export type ScenarioDescriptor = {
    vis: string;
    scenario: string;
    buckets: IBucket[];
};

export class ExecutionRecording implements IRecording {
    public readonly fingerprint: string;
    public readonly definition: IExecutionDefinition;
    public readonly scenarios: ScenarioDescriptor[];
    public readonly directory: string;

    private readonly dataViewRequests: DataViewRequests;

    constructor(directory: string) {
        this.directory = directory;
        const [definition, fingerprint] = loadDefinition(directory);

        this.definition = definition;
        this.fingerprint = fingerprint;

        this.scenarios = loadScenarios(directory);
        this.dataViewRequests = loadDataViewRequests(directory);
    }

    public getRecordingType(): RecordingType {
        return RecordingType.Execution;
    }

    public getRecordingName(): string {
        return `fp_${this.fingerprint}`;
    }

    public isComplete(): boolean {
        return this.hasResult() && this.hasAllDataViewFiles();
    }

    public async makeRecording(backend: IAnalyticalBackend, workspace: string): Promise<void> {
        // exec definitions are stored with some test workspace in them; make sure the exec definition that will actually
        //  contain ID of workspace specified by the user
        const workspaceBoundDef: IExecutionDefinition = {
            ...this.definition,
            workspace,
        };

        const result: IExecutionResult = await backend
            .workspace(workspace)
            .execution()
            .forDefinition(workspaceBoundDef)
            .execute();

        writeAsJsonSync(
            path.join(this.directory, ExecutionResultFile),
            result,
            ExecutionResultPropsToSerialize,
        );

        const missingFiles = Object.entries(this.getMissingDataViewFiles());

        for (const [filename, requestType] of missingFiles) {
            let dataView;

            if (requestType === "all") {
                dataView = await result.readAll();
            } else {
                dataView = await result.readWindow(requestType.offset, requestType.size);
            }

            writeAsJsonSync(filename, dataView, DataViewPropsToSerialize);
        }

        return;
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        const dataViewFiles: RecordingIndexEntry = Object.keys(this.getRequiredDataViewFiles()).reduce(
            (acc: RecordingIndexEntry, filename) => {
                acc[path.basename(filename, ".json")] = filename;

                return acc;
            },
            {},
        );

        const entry: RecordingIndexEntry = {
            definition: path.join(this.directory, ExecutionDefinitionFile),
            executionResult: path.join(this.directory, ExecutionResultFile),
            ...dataViewFiles,
        };

        const scenariosFile = path.join(this.directory, ScenariosFile);
        if (fs.existsSync(scenariosFile)) {
            entry.scenarios = scenariosFile;
        }

        return entry;
    }

    private hasResult(): boolean {
        const resultFile = path.join(this.directory, ExecutionResultFile);

        return fs.existsSync(resultFile);
    }

    private hasAllDataViewFiles(): boolean {
        return isEmpty(Object.keys(this.getMissingDataViewFiles()));
    }

    private getMissingDataViewFiles(): DataViewFiles {
        return pickBy(this.getRequiredDataViewFiles(), (_, filename) => !fs.existsSync(filename));
    }

    private getRequiredDataViewFiles(): DataViewFiles {
        const files: DataViewFiles = {};

        if (this.dataViewRequests.allData) {
            const filename = path.join(this.directory, DataViewAllFile);

            files[filename] = "all";
        }

        if (this.dataViewRequests.windows) {
            this.dataViewRequests.windows.forEach(win => {
                const filename = path.join(this.directory, DataViewWindowFile(win));

                files[filename] = win;
            });
        }

        return files;
    }
}
