// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { axisNameCustomization } from "../_infra/axisNameCustomization";
import {
    ComboChartWithArithmeticMeasuresAndViewBy,
    ComboChartWithMultipleMeasuresAndNoViewBy,
    ComboChartWithTwoMeasuresAndNoViewBy,
    ComboChartWithTwoMeasuresAndViewBy,
} from "./base";
import { comboVariants } from "./_variants";

const twoMeasures = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis two measures with slicing" })
    .addScenarios("dual axis two measures with slicing", ComboChartWithTwoMeasuresAndViewBy, comboVariants);

const twoMeasuresNoSlicing = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis two measures without slicing" })
    .addScenarios("dual axis two measures with slicing", ComboChartWithTwoMeasuresAndNoViewBy, comboVariants);

const multipleMeasures = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis multiple measures with slicing" })
    .addScenarios(
        "dual axis two measures with slicing",
        ComboChartWithArithmeticMeasuresAndViewBy,
        comboVariants,
    );

const multipleMeasuresNoSlicing = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis multiple measures without slicing" })
    .addScenarios(
        "dual axis multiple measures without slicing",
        ComboChartWithMultipleMeasuresAndNoViewBy,
        comboVariants,
    );

const axisNameConfig = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "axis name configuration" })
    .addScenarios("axis name configuration", ComboChartWithTwoMeasuresAndViewBy, axisNameCustomization);

const others = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("dual axis disabled", {
        ...ComboChartWithTwoMeasuresAndViewBy,
        config: {
            dualAxis: false,
        },
    });

export default [
    twoMeasures,
    twoMeasuresNoSlicing,
    multipleMeasures,
    multipleMeasuresNoSlicing,
    axisNameConfig,
    others,
];
