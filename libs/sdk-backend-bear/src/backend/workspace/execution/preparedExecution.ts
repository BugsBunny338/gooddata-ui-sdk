// (C) 2019-2020 GoodData Corporation

import { IExecutionFactory, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    SortItem,
} from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types";
import { convertExecutionApiError } from "../../../errors/errorHandling";
import { BearExecutionResult } from "./executionResult";
import { toAfmExecution } from "../../../toAfm/toAfmResultSpec";

export class BearPreparedExecution implements IPreparedExecution {
    private _fingerprint: string | undefined;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
    ) {}

    public async execute(): Promise<IExecutionResult> {
        checkDefIsExecutable(this.definition);

        const afmExecution = toAfmExecution(this.definition);

        return this.authCall(sdk =>
            sdk.execution
                .getExecutionResponse(this.definition.workspace, afmExecution)
                .then(response => {
                    return new BearExecutionResult(
                        this.authCall,
                        this.definition,
                        this.executionFactory,
                        response,
                    );
                })
                .catch(e => {
                    throw convertExecutionApiError(e);
                }),
        );
    }

    public withDimensions(...dimsOrGen: Array<IDimension | DimensionGenerator>): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithDimensions(this.definition, ...dimsOrGen));
    }

    public withSorting(...items: SortItem[]): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithSorting(this.definition, items));
    }

    public fingerprint(): string {
        if (!this._fingerprint) {
            this._fingerprint = defFingerprint(this.definition);
        }

        return this._fingerprint;
    }

    public equals(other: IPreparedExecution): boolean {
        return this.fingerprint() === other.fingerprint();
    }
}

// @ts-ignore
function checkDefIsExecutable(def: IExecutionDefinition): void {
    return;
}
