// (C) 2019 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IntlWrapper } from "@gooddata/sdk-ui";
import Overlay from "@gooddata/goodstrap/lib/core/Overlay";
import { DropdownBody } from "./DropdownBody";
import { MeasureValueFilterOperator, IValue } from "./types";

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];
/*
 * TODO: same thing is in sdk-ui-ext .. but filters must not depend on it. we may be in need of some lower-level
 *  project on which both of filters and ext can depend. perhaps the purpose of the new project would be to provide
 *  thin layer on top of goodstrap (?)
 */
const DROPDOWN_ALIGMENTS = alignPoints.map(align => ({ align, offset: { x: 1, y: 0 } }));

export interface IDropdownOwnProps {
    onApply: (operator: string, value?: IValue) => void;
    onCancel: () => void;
    operator?: MeasureValueFilterOperator;
    value?: IValue;
    usePercentage?: boolean;
    warningMessage?: string;
    locale?: string;
    anchorEl: EventTarget | string;
}

export type IDropdownProps = WrappedComponentProps & IDropdownOwnProps;

interface IDropdownState {
    displayDropdown: boolean;
}

class DropdownWrapped extends React.PureComponent<IDropdownProps, IDropdownState> {
    public static defaultProps: Partial<IDropdownProps> = {
        value: {},
        operator: "ALL",
    };

    public render() {
        const { operator, value, usePercentage, warningMessage, locale, onCancel, anchorEl } = this.props;

        const selectedOperator: MeasureValueFilterOperator = operator !== null ? operator : "ALL";

        return (
            <Overlay
                alignTo={anchorEl}
                alignPoints={DROPDOWN_ALIGMENTS}
                closeOnOutsideClick={true}
                closeOnParentScroll={true}
                closeOnMouseDrag={true}
                onClose={onCancel}
            >
                <DropdownBody
                    operator={selectedOperator}
                    value={value}
                    usePercentage={usePercentage}
                    warningMessage={warningMessage}
                    locale={locale}
                    onCancel={onCancel}
                    onApply={this.onApply}
                />
            </Overlay>
        );
    }

    private onApply = (operator: MeasureValueFilterOperator | null, value: IValue) => {
        this.props.onApply(operator, value);
    };
}

export const DropdownWithIntl = injectIntl(DropdownWrapped);

export class Dropdown extends React.PureComponent<IDropdownOwnProps, IDropdownState> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <DropdownWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
