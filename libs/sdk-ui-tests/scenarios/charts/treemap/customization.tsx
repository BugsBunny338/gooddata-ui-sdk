// (C) 2007-2019 GoodData Corporation
import { ITreemapProps, Treemap } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { TreemapWithMeasureViewByAndSegmentBy } from "./base";

const legendScenarios = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", TreemapWithMeasureViewByAndSegmentBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", TreemapWithMeasureViewByAndSegmentBy, dataLabelCustomizer);

export default [legendScenarios, dataLabelScenarios];
