// (C) 2007-2019 GoodData Corporation

import * as path from "path";
import { OptionalKind, VariableDeclarationKind, VariableStatementStructure } from "ts-morph";
import { createUniqueVariableName } from "../base/variableNaming";
import flatMap = require("lodash/flatMap");
import groupBy = require("lodash/groupBy");
import { ExecutionRecording } from "../recordings/execution";

const ScenariosConstName = "Scenarios";

function executionRecordingInit(rec: ExecutionRecording, targetDir: string): string {
    const entries = Object.entries(rec.getEntryForRecordingIndex());

    return `{ ${entries
        .map(([type, file]) => `${type}: require('./${path.relative(targetDir, file)}')`)
        .join(",")} }`;
}

function generateRecordingConst(
    rec: ExecutionRecording,
    targetDir: string,
): OptionalKind<VariableStatementStructure> {
    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: false,
        declarations: [
            {
                name: rec.getRecordingName(),
                initializer: executionRecordingInit(rec, targetDir),
            },
        ],
    };
}

//
// generating initializer for map of maps .. fun times.
//

type VisScenarioRecording = [string, string, ExecutionRecording];

function generateScenarioForVis(entries: VisScenarioRecording[]): string {
    return `{ ${entries
        .map(
            ([_, entryName, entryRecording]) =>
                `${createUniqueVariableName(entryName, {})}: ${entryRecording.getRecordingName()}`,
        )
        .join(",")} }`;
}

function generateScenariosConst(recordings: ExecutionRecording[]): OptionalKind<VariableStatementStructure> {
    const recsWithVisAndScenario = flatMap(recordings, rec =>
        rec.scenarios.map<VisScenarioRecording>(s => [s.vis, s.scenario, rec]),
    );
    const entriesByVis = Object.entries(groupBy(recsWithVisAndScenario, r => r[0]));

    return {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
            {
                name: ScenariosConstName,
                initializer: `{ ${entriesByVis
                    .map(([vis, visScenarios]) => `${vis}: ${generateScenarioForVis(visScenarios)}`)
                    .join(",")} }`,
            },
        ],
    };
}

/**
 * Generate constants for the execution recordings. This function will return non-exported constant per recording
 * and then also an exported 'Scenarios' constant that is a map from vis => scenario => recording.
 *
 * @param recordings - recordings to generate constants for
 * @param targetDir - absolute path to directory where index will be stored, this is needed so that paths can be
 *   made relative for require()
 */
export function generateConstantsForExecutions(
    recordings: ExecutionRecording[],
    targetDir: string,
): Array<OptionalKind<VariableStatementStructure>> {
    return [...recordings.map(r => generateRecordingConst(r, targetDir)), generateScenariosConst(recordings)];
}