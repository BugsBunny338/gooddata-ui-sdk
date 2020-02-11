// (C) 2019 GoodData Corporation
import * as React from "react";
import { DefaultLocale, ChartType } from "../../../base";

import { IFeatureFlags, IReferences, IVisualizationProperties } from "../../interfaces/Visualization";
import { IColorConfiguration } from "../../interfaces/Colors";
import ColorsSection from "../configurationControls/colors/ColorsSection";
import LegendSection from "../configurationControls/legend/LegendSection";
import { InternalIntlWrapper } from "../../utils/internalIntlProvider";
import { IInsight, insightHasMeasures } from "@gooddata/sdk-model";
import noop = require("lodash/noop");
import { getMeasuresFromMdObject } from "../../utils/bucketHelper";

export interface IConfigurationPanelContentProps {
    properties?: IVisualizationProperties;
    references?: IReferences;
    propertiesMeta?: any;
    colors?: IColorConfiguration;
    locale: string;
    type?: ChartType;
    isError?: boolean;
    isLoading?: boolean;
    insight?: IInsight;
    featureFlags?: IFeatureFlags;
    axis?: string;
    pushData?(data: any): void;
}

export default abstract class ConfigurationPanelContent extends React.PureComponent<
    IConfigurationPanelContentProps
> {
    public static defaultProps: IConfigurationPanelContentProps = {
        properties: null,
        references: null,
        propertiesMeta: null,
        colors: null,
        locale: DefaultLocale,
        isError: false,
        isLoading: false,
        insight: null,
        pushData: noop,
        featureFlags: {},
        axis: null,
    };

    protected supportedPropertiesList: string[];

    public render() {
        return (
            <div key={`config-${this.props.type}`}>
                <InternalIntlWrapper locale={this.props.locale}>
                    {this.renderConfigurationPanel()}
                </InternalIntlWrapper>
            </div>
        );
    }

    protected abstract renderConfigurationPanel(): JSX.Element;

    protected isControlDisabled() {
        const { insight, isError, isLoading } = this.props;
        return !insight || !insightHasMeasures(insight) || isError || isLoading;
    }

    protected renderColorSection() {
        const {
            properties,
            propertiesMeta,
            pushData,
            colors,
            featureFlags,
            references,
            insight,
            isLoading,
        } = this.props;

        const controlsDisabled = this.isControlDisabled();
        const hasMeasures = getMeasuresFromMdObject(insight).length > 0;

        return (
            <ColorsSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                references={references}
                colors={colors}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
                hasMeasures={hasMeasures}
                showCustomPicker={featureFlags.enableCustomColorPicker as boolean}
                isLoading={isLoading}
            />
        );
    }

    protected renderLegendSection() {
        const { properties, propertiesMeta, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <LegendSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
            />
        );
    }
}
