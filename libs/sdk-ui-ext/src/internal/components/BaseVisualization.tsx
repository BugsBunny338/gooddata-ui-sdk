// (C) 2019 GoodData Corporation
import { IAnalyticalBackend, IExecutionFactory } from "@gooddata/sdk-backend-spi";
import { IInsightDefinition, insightProperties, IVisualizationClass, visClassUrl } from "@gooddata/sdk-model";
import * as React from "react";
import { render } from "react-dom";
import * as uuid from "uuid";
import {
    IDrillableItem,
    ILocale,
    OnError,
    OnExportReady,
    OnLoadingChanged,
    VisualizationEnvironment,
} from "@gooddata/sdk-ui";
import {
    ConfigPanelClassName,
    IBucketItem,
    IFeatureFlags,
    IGdcConfig,
    IReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisualization,
} from "../interfaces/Visualization";
import {
    DefaultVisualizationCatalog,
    IVisualizationCatalog,
    PluggableVisualizationFactory,
} from "./VisualizationCatalog";
import isEmpty = require("lodash/isEmpty");
import isEqual = require("lodash/isEqual");
import noop = require("lodash/noop");
import omit = require("lodash/omit");

export interface IBaseVisualizationProps extends IVisCallbacks {
    backend: IAnalyticalBackend;
    projectId: string;
    insight: IInsightDefinition;
    config?: IGdcConfig;
    visualizationClass: IVisualizationClass;
    environment?: VisualizationEnvironment;
    stickyHeaderOffset?: number;
    height?: number;
    locale?: ILocale;
    drillableItems: IDrillableItem[];
    totalsEditAllowed?: boolean;
    featureFlags?: IFeatureFlags;
    visualizationCatalog?: IVisualizationCatalog;
    newDerivedBucketItems?: IBucketItem[];
    referencePoint?: IReferencePoint;
    onError: OnError;
    onExportReady: OnExportReady;
    onLoadingChanged: OnLoadingChanged;
    isMdObjectValid?: boolean;
    configPanelClassName?: string;
    onExtendedReferencePointChanged?(): void;
    onNewDerivedBucketItemsPlaced?(): void;
    renderer?(component: any, target: Element): void;
}

export class BaseVisualization extends React.PureComponent<IBaseVisualizationProps> {
    public static defaultProps: Partial<IBaseVisualizationProps> = {
        visualizationCatalog: DefaultVisualizationCatalog,
        newDerivedBucketItems: [],
        referencePoint: null,
        onExtendedReferencePointChanged: noop,
        onNewDerivedBucketItemsPlaced: noop,
        isMdObjectValid: true,
        configPanelClassName: ConfigPanelClassName,
        featureFlags: {},
        renderer: render,
    };

    private visElementId: string;
    private visualization: IVisualization;
    private executionFactory: IExecutionFactory;

    constructor(props: IBaseVisualizationProps) {
        super(props);
        this.visElementId = uuid.v4();
        this.executionFactory = props.backend.workspace(props.projectId).execution();
    }

    public componentWillUnmount() {
        this.visualization.unmount();
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IBaseVisualizationProps) {
        const newDerivedBucketItemsChanged =
            !isEmpty(nextProps.newDerivedBucketItems) &&
            !isEqual(nextProps.newDerivedBucketItems, this.props.newDerivedBucketItems);

        if (newDerivedBucketItemsChanged) {
            this.triggerPlaceNewDerivedBucketItems(nextProps);
            return;
        }

        const visualizationClassChanged = !isEqual(
            nextProps.visualizationClass,
            this.props.visualizationClass,
        );
        const referencePointChanged = BaseVisualization.bucketReferencePointHasChanged(
            this.props.referencePoint,
            nextProps.referencePoint,
        );

        if (visualizationClassChanged) {
            this.visElementId = uuid.v4();
            this.setupVisualization(nextProps);
        }

        if (referencePointChanged || visualizationClassChanged) {
            this.triggerExtendedReferencePointChanged(
                nextProps,
                // only pass current props if the visualization class is the same (see getExtendedReferencePoint JSDoc)
                visualizationClassChanged ? undefined : this.props,
            );
        }
    }

    public componentDidMount() {
        this.setupVisualization(this.props);
        this.updateVisualization();
        this.triggerExtendedReferencePointChanged(this.props);
    }

    public componentDidUpdate() {
        if (this.props.isMdObjectValid) {
            this.updateVisualization();
        }
    }

    public render() {
        return <div key={this.visElementId} style={{ height: "100%" }} className={this.getClassName()} />;
    }

    private getVisElementClassName(): string {
        return `gd-vis-${this.visElementId}`;
    }

    private getClassName(): string {
        return `gd-base-visualization ${this.getVisElementClassName()}`;
    }

    private setupVisualization(props: IBaseVisualizationProps) {
        const {
            visualizationClass,
            environment,
            locale,
            featureFlags,
            projectId,
            configPanelClassName,
            renderer,
        } = props;

        if (this.visualization) {
            this.visualization.unmount();
        }

        const visUri = visClassUrl(visualizationClass);
        let visFactory: PluggableVisualizationFactory | undefined;

        try {
            visFactory = this.props.visualizationCatalog.forUri(visUri);
        } catch (e) {
            console.error(`Error: unsupported visualization type - ${visUri}`); // tslint:disable-line
        }

        if (visFactory) {
            const constructorParams: IVisConstruct = {
                projectId,
                locale,
                environment,
                backend: props.backend,
                element: `.${this.getVisElementClassName()}`,
                configPanelElement: `.${configPanelClassName}`,
                callbacks: {
                    afterRender: props.afterRender,
                    onLoadingChanged: props.onLoadingChanged,
                    onError: props.onError,
                    onExportReady: props.onExportReady,
                    pushData: props.pushData,
                    onDrill: props.onDrill,
                },
                featureFlags,
                visualizationProperties: insightProperties(props.insight),
                renderFun: renderer,
            };

            this.visualization = visFactory(constructorParams);
        }
    }

    private updateVisualization() {
        if (!this.visualization) {
            return;
        }

        this.visualization.update(
            {
                locale: this.props.locale,
                dimensions: {
                    height: this.props.height,
                },
                custom: {
                    stickyHeaderOffset: this.props.stickyHeaderOffset,
                    drillableItems: this.props.drillableItems,
                    totalsEditAllowed: this.props.totalsEditAllowed,
                },
                config: this.props.config,
            },
            this.props.insight,
            this.executionFactory,
        );
    }

    private triggerPlaceNewDerivedBucketItems(props: IBaseVisualizationProps) {
        const { newDerivedBucketItems, referencePoint, onNewDerivedBucketItemsPlaced } = props;

        if (this.visualization && referencePoint && newDerivedBucketItems && onNewDerivedBucketItemsPlaced) {
            this.visualization
                .addNewDerivedBucketItems(referencePoint, newDerivedBucketItems)
                .then(onNewDerivedBucketItemsPlaced);
        }
    }

    private triggerExtendedReferencePointChanged(
        newProps: IBaseVisualizationProps,
        currentProps?: IBaseVisualizationProps,
    ) {
        const { referencePoint: newReferencePoint, onExtendedReferencePointChanged } = newProps;

        if (this.visualization && newReferencePoint && onExtendedReferencePointChanged) {
            this.visualization
                .getExtendedReferencePoint(newReferencePoint, currentProps && currentProps.referencePoint)
                .then(onExtendedReferencePointChanged);
        }
    }

    private static bucketReferencePointHasChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ) {
        return !isEqual(omit(currentReferencePoint, "properties"), omit(nextReferencePoint, "properties"));
    }
}
