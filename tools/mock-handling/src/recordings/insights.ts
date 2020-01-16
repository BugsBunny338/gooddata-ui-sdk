// (C) 2007-2020 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import fs from "fs";
import path from "path";
import { createUniqueVariableNameForIdentifier } from "../base/variableNaming";
import { IRecording, RecordingIndexEntry, RecordingType, writeAsJsonSync } from "./common";
import isEmpty = require("lodash/isEmpty");

//
// internal constants & types
//

//
// Public API
//

export const InsightsDefinition = "insights.json";
const InsightObj = "obj.json";

type InsightRecordingSpec = {
    comment?: string;
    visName?: string;
    scenarioName?: string;
};

export class InsightRecording implements IRecording {
    public readonly directory: string;
    private readonly insightId: string;
    private readonly objFile: string;
    private readonly spec: InsightRecordingSpec;

    constructor(rootDir: string, id: string, spec: InsightRecordingSpec = {}) {
        this.directory = path.join(rootDir, id);
        this.insightId = id;
        this.spec = spec;

        this.objFile = path.join(this.directory, InsightObj);
    }

    public getRecordingType(): RecordingType {
        return RecordingType.Insights;
    }

    public getRecordingName(): string {
        return `i_${createUniqueVariableNameForIdentifier(this.insightId)}`;
    }

    public isComplete(): boolean {
        return fs.existsSync(this.directory) && fs.existsSync(this.objFile);
    }

    public getEntryForRecordingIndex(): RecordingIndexEntry {
        return {
            obj: this.objFile,
        };
    }

    public async makeRecording(backend: IAnalyticalBackend, workspace: string): Promise<void> {
        const obj = await backend
            .workspace(workspace)
            .metadata()
            .getInsight(idRef(this.insightId));

        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
        }

        writeAsJsonSync(this.objFile, obj);
    }

    public getVisName(): string {
        return this.spec.visName!;
    }

    public getScenarioName(): string {
        return this.spec.scenarioName!;
    }

    /**
     * Tests whether the recording contains information about visualization and scenario that the
     * insight exercises. This information is essential for the recording to be included in the named
     * insights index.
     */
    public hasVisAndScenarioInfo(): boolean {
        return !isEmpty(this.spec.visName) && !isEmpty(this.spec.scenarioName);
    }
}
