// (C) 2019 GoodData Corporation
import * as React from "react";

/**
 * @public
 */
export interface ISdkComponentProps {
    message: string;
}

/**
 * @public
 */
export class SdkComponent extends React.Component<ISdkComponentProps> {
    public render() {
        return <p>{this.props.message}</p>;
    }
}

/**
 * @private
 */
export function functionInternalToThisComponent(input: string): string {
    return `Hello ${input}!`;
}
