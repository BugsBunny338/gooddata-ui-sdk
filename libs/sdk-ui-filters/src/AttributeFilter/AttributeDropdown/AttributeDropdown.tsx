// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IAttributeElement, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import Dropdown, { DropdownButton } from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import { string as stringUtils } from "@gooddata/js-utils";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import * as classNames from "classnames";
import debounce = require("lodash/debounce");
import noop = require("lodash/noop");

import { AttributeDropdownBody } from "./AttributeDropdownBody";
import { MAX_SELECTION_SIZE } from "./AttributeDropdownList";
import { mergeElementQueryResults } from "./mergeElementQueryResults";
import {
    IElementQueryResultWithEmptyItems,
    EmptyListItem,
    AttributeListItem,
    isNonEmptyListItem,
} from "./types";

import isEmpty = require("lodash/isEmpty");
import isEqual = require("lodash/isEqual");

const LIMIT = MAX_SELECTION_SIZE + 50;

const DefaultFilterLoading = injectIntl(({ intl }) => {
    return (
        <button className="gd-button gd-button-secondary gd-button-small icon-right icon disabled s-button-loading">
            {intl.formatMessage({ id: "gs.filter.loading" })}
        </button>
    );
});

export interface IAttributeDropdownOwnProps {
    title: string;

    backend: IAnalyticalBackend;
    workspace: string;
    displayForm: ObjRef;

    selectedItems?: Array<Partial<IAttributeElement>>;
    isInverted?: boolean;

    onApply: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    fullscreenOnMobile?: boolean;
    titleWithSelection?: boolean;
    FilterLoading?: React.ComponentType;
    isLoading?: boolean;
}

type IAttributeDropdownProps = IAttributeDropdownOwnProps & WrappedComponentProps;

export interface IAttributeDropdownState {
    validElements?: IElementQueryResultWithEmptyItems;

    selectedItems: Array<Partial<IAttributeElement>>;
    isInverted: boolean;

    prevSelectedItems: Array<Partial<IAttributeElement>>;
    prevIsInverted: boolean;

    isLoading: boolean;
    error?: any;
    searchString: string;

    // paging
    offset: number;
    limit: number;
    totalCount?: string;

    items: AttributeListItem[];
}

export class AttributeDropdownCore extends React.PureComponent<
    IAttributeDropdownProps,
    IAttributeDropdownState
> {
    public static defaultProps = {
        fullscreenOnMobile: false,
        titleWithSelection: false,
        FilterLoading: DefaultFilterLoading,
        isLoading: false,
    };

    private dropdownRef = React.createRef<Dropdown>();

    private MediaQuery?: ({
        children,
    }: {
        children: (isMobile: boolean) => React.ReactNode;
    }) => React.ReactNode;

    private getBackend = () => {
        return this.props.backend.withTelemetry("AttributeFilter", this.props);
    };

    constructor(props: IAttributeDropdownProps) {
        super(props);

        const selectedItems = props.selectedItems || [];
        const isInverted = props.isInverted !== undefined ? props.isInverted : true;

        this.state = {
            validElements: null,

            selectedItems,
            isInverted,

            prevSelectedItems: selectedItems,
            prevIsInverted: isInverted,

            isLoading: false,
            limit: LIMIT,
            offset: 0,
            searchString: "",

            items: [],
        };

        this.createMediaQuery(props.fullscreenOnMobile);
    }

    public componentDidMount(): void {
        if (this.props.displayForm && this.props.titleWithSelection) {
            this.getElements();
        }
    }

    public componentDidUpdate(prevProps: IAttributeDropdownProps, prevState: IAttributeDropdownState): void {
        const needsInvalidation =
            !areObjRefsEqual(this.props.displayForm, prevProps.displayForm) ||
            this.props.workspace !== prevProps.workspace ||
            this.state.searchString !== prevState.searchString;

        if (needsInvalidation) {
            this.setState(
                {
                    validElements: null,
                    error: null,
                    isLoading: false,
                    offset: 0,
                    totalCount: undefined,
                    limit: LIMIT,
                },
                () => this.getElements(),
            );
        }
    }

    public getElements = async () => {
        const { offset, limit, validElements } = this.state;

        const currentElements = validElements ? validElements.items : [];

        const isQueryOutOfBounds = offset + limit > currentElements.length;
        const isMissingDataInWindow = currentElements
            .slice(offset, offset + limit)
            .some((e: IAttributeElement | EmptyListItem) => (e as EmptyListItem).empty);

        const hasAllData =
            validElements &&
            currentElements.length === validElements.totalCount &&
            !currentElements.some((e: IAttributeElement | EmptyListItem) => (e as EmptyListItem).empty);

        const needsLoading = !hasAllData && (isQueryOutOfBounds || isMissingDataInWindow);

        if (needsLoading) {
            this.loadElements(offset, limit);
        }
    };

    private updateSelectedItemsWithData = (
        selection: Array<Partial<IAttributeElement>>,
        items: AttributeListItem[],
    ) => {
        const nonEmptyItems = items.filter(isNonEmptyListItem);
        return selection.map(selectedItem => {
            const foundItem = nonEmptyItems.find(
                item =>
                    (selectedItem.uri && item.uri === selectedItem.uri) ||
                    (selectedItem.title && item.title === selectedItem.title),
            );
            return foundItem || selectedItem;
        });
    };

    private onSearch = debounce((query: string) => {
        this.setState({ searchString: query });
    }, 250);

    private clearSearchString = () => {
        this.setState({ searchString: "" });
    };

    private loadElements = async (offset: number, limit: number) => {
        const { workspace, displayForm } = this.props;

        this.setState({ isLoading: true });

        const newElements = await this.getBackend()
            .workspace(workspace)
            .elements()
            .forDisplayForm(displayForm)
            .withOptions({
                ...(this.state.searchString ? { filter: this.state.searchString } : {}),
            })
            .withOffset(offset)
            .withLimit(limit)
            .query();

        this.setState(state => {
            const mergedValidElements = mergeElementQueryResults(state.validElements, newElements);
            const { items } = mergedValidElements;

            // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
            // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
            const updatedSelectedItems = this.updateSelectedItemsWithData(this.state.selectedItems, items);
            const updatedPrevSelectedItems = this.updateSelectedItemsWithData(
                this.state.prevSelectedItems,
                items,
            );

            return {
                ...state,
                selectedItems: updatedSelectedItems,
                prevSelectedItems: updatedPrevSelectedItems,
                isLoading: false,
                validElements: mergedValidElements,
                items,
            };
        });
    };

    private truncateTitle = (title: string, length?: number, ending?: string) => {
        const titleLength = length ? length : 35;
        const endingStr = ending ? ending : "...";

        if (title.length > titleLength) {
            return title.slice(0, titleLength) + endingStr;
        }

        return title;
    };

    private getAllTitleIntl = (isInverted: boolean, empty: boolean, equal: boolean) => {
        if ((isInverted && empty) || (!isInverted && equal)) {
            return this.props.intl.formatMessage({ id: "attrf.all" });
        }
        return this.props.intl.formatMessage({ id: "attrf.all_except" });
    };

    private getTitle = () => {
        const { items, isInverted, isLoading, selectedItems } = this.state;
        const { title, displayForm, titleWithSelection } = this.props;

        if (!isLoading && titleWithSelection && displayForm) {
            const empty = isEmpty(selectedItems);
            const equal = isEqual(items.length, selectedItems.length);
            const getAllPartIntl = this.getAllTitleIntl(isInverted, empty, equal);

            if (empty) {
                return isInverted ? `${title}: ${getAllPartIntl}` : title;
            }
            if (equal) {
                return isInverted ? title : `${title}: ${getAllPartIntl}`;
            }

            const itemTitlesToString = selectedItems.map(selectedItem => selectedItem.title).join(", ");
            const fullTitle = isInverted
                ? `${title}: ${getAllPartIntl} ${itemTitlesToString}`
                : `${title}: ${itemTitlesToString}`;

            return `${this.truncateTitle(fullTitle)} (${selectedItems.length})`;
        }

        return title;
    };

    public render() {
        const { FilterLoading, titleWithSelection } = this.props;
        const customizedTitle = this.getTitle();
        const classes = classNames(
            "gd-attribute-filter",
            customizedTitle ? `gd-id-${stringUtils.simplifyText(customizedTitle)}` : "",
        );

        return (titleWithSelection && this.state.isLoading) || this.props.isLoading ? (
            <FilterLoading />
        ) : (
            <Dropdown
                button={<DropdownButton value={customizedTitle} />}
                ref={this.dropdownRef}
                body={this.renderDropdownBody()}
                className={classes}
                MediaQuery={this.MediaQuery}
                onOpenStateChanged={this.onDropdownOpenStateChanged}
            />
        );
    }

    private createMediaQuery(fullscreenOnMobile: boolean) {
        this.MediaQuery = fullscreenOnMobile
            ? undefined
            : ({ children }: { children: (isMobile: boolean) => React.ReactNode }) => children(false);
    }

    private backupSelection = (callback: () => any = noop) => {
        const { selectedItems, isInverted } = this.state;
        this.setState(
            {
                prevSelectedItems: selectedItems,
                prevIsInverted: isInverted,
            },
            callback,
        );
    };

    private restoreSelection = () => {
        const { prevSelectedItems, prevIsInverted } = this.state;
        this.setState({
            selectedItems: prevSelectedItems,
            isInverted: prevIsInverted,
        });
    };

    private onDropdownOpenStateChanged = (isOpen: boolean) => {
        if (isOpen) {
            this.getElements();
        } else {
            this.clearSearchString();
            this.restoreSelection();
        }
    };

    private closeDropdown = () => {
        if (this.dropdownRef.current) {
            this.dropdownRef.current.closeDropdown();
        }
    };

    private onApplyButtonClicked = () => {
        this.props.onApply(this.state.selectedItems.filter(isNonEmptyListItem), this.state.isInverted);
        this.backupSelection(this.closeDropdown);
    };

    private onCloseButtonClicked = () => {
        this.closeDropdown();
    };

    private onSelect = (selectedItems: IAttributeElement[], isInverted: boolean) => {
        this.setState({
            selectedItems,
            isInverted,
        });
    };

    private onRangeChange = (_searchString: string, from: number, to: number) => {
        this.setState({ offset: from, limit: to - from }, () => this.getElements());
    };

    private renderDropdownBody() {
        const { selectedItems, isInverted, error, isLoading, validElements, searchString } = this.state;

        const shouldDisableApplyButton = error || isLoading || (validElements && !validElements.items.length);
        const hasTriedToLoadData = validElements && validElements.items;

        return (
            <AttributeDropdownBody
                error={error}
                isLoading={!hasTriedToLoadData && isLoading}
                items={validElements ? validElements.items : []}
                isInverted={isInverted}
                onRangeChange={this.onRangeChange}
                selectedItems={selectedItems}
                totalCount={validElements ? validElements.totalCount : LIMIT}
                applyDisabled={shouldDisableApplyButton}
                onSearch={this.onSearch}
                searchString={searchString}
                onSelect={this.onSelect}
                onApplyButtonClicked={this.onApplyButtonClicked}
                onCloseButtonClicked={this.onCloseButtonClicked}
            />
        );
    }
}

export const AttributeDropdown = injectIntl(AttributeDropdownCore);
