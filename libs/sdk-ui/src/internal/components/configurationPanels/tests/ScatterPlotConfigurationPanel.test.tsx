// (C) 2019 GoodData Corporation
import { IInsight, newMeasure } from "@gooddata/sdk-model";
import * as React from "react";
import { shallow } from "enzyme";
import { insightWithSingleAttribute } from "../../../mocks/testMocks";
import ScatterPlotConfigurationPanel from "../ScatterPlotConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";
import ConfigSection from "../../configurationControls/ConfigSection";
import { DEFAULT_LOCALE } from "../../../../base/constants/localization";
import NameSubsection from "../../configurationControls/axis/NameSubsection";
import { VisualizationTypes } from "../../../..";

describe("ScatterPlotConfigurationPanel", () => {
    function createComponent(
        props: IConfigurationPanelContentProps = {
            locale: DEFAULT_LOCALE,
        },
    ) {
        return shallow<IConfigurationPanelContentProps, null>(<ScatterPlotConfigurationPanel {...props} />, {
            lifecycleExperimental: true,
        });
    }

    function newInsight(measureBucket: string): IInsight {
        return {
            insight: {
                title: "My Insight",
                sorts: [],
                filters: [],
                visualizationClassIdentifier: "vc",
                properties: {},
                identifier: "id",
                buckets: [
                    {
                        localIdentifier: measureBucket,
                        items: [newMeasure("testMeasure")],
                    },
                ],
            },
        };
    }

    it("should render three sections in configuration panel for bubble chart", () => {
        const wrapper = createComponent();

        expect(wrapper.find(ConfigSection).length).toBe(3);
    });

    describe("axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DEFAULT_LOCALE,
            type: VisualizationTypes.SCATTER,
            featureFlags: {
                enableAxisNameConfiguration: true,
            },
        };

        it("should render configuration panel with enabled name sections", () => {
            const insight: IInsight = {
                insight: {
                    title: "My Insight",
                    sorts: [],
                    filters: [],
                    visualizationClassIdentifier: "vc",
                    properties: {},
                    identifier: "id",
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "measureId",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: "/gdc/md/projectId/obj/9211",
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            localIdentifier: "secondary_measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "secondary_measureId",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: "/gdc/md/projectId/obj/9203",
                                                },
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            };

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toEqual(false);

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toEqual(false);
        });

        it("should render configuration panel with disabled name sections", () => {
            const insight: IInsight = {
                insight: {
                    title: "My Insight",
                    sorts: [],
                    filters: [],
                    visualizationClassIdentifier: "vc",
                    properties: {},
                    identifier: "id",
                    buckets: [] as any,
                },
            };

            const wrapper = createComponent({
                ...defaultProps,
                insight,
            });

            const axisSections = wrapper.find(NameSubsection);

            const xAxisSection = axisSections.at(0);
            expect(xAxisSection.props().disabled).toBe(true);

            const yAxisSection = axisSections.at(1);
            expect(yAxisSection.props().disabled).toBe(true);
        });

        it.each([[false, true, "measures"], [true, false, "secondary_measures"]])(
            "should render configuration panel with X axis name section is disabled=%s and Y axis name section is disabled=%s",
            (
                expectedXAxisSectionDisabled: boolean,
                expectedYAxisSectionDisabled: boolean,
                measureIdentifier: string,
            ) => {
                const wrapper = createComponent({
                    ...defaultProps,
                    insight: newInsight(measureIdentifier),
                });

                const axisSections = wrapper.find(NameSubsection);

                const xAxisSection = axisSections.at(0);
                expect(xAxisSection.props().disabled).toEqual(expectedXAxisSectionDisabled);

                const yAxisSection = axisSections.at(1);
                expect(yAxisSection.props().disabled).toEqual(expectedYAxisSectionDisabled);
            },
        );

        it("should not render name sections in configuration panel", () => {
            const wrapper = createComponent({
                ...defaultProps,
                featureFlags: {
                    enableAxisNameConfiguration: false,
                },
                insight: insightWithSingleAttribute,
            });

            const axisSections = wrapper.find(NameSubsection);
            expect(axisSections.exists()).toEqual(false);
        });
    });
});
