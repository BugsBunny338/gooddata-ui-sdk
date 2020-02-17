// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { ComboChartWithArithmeticMeasuresAndViewBy } from "./base";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { BlackColor, CustomColorPalette, CustomPaletteColor } from "../../_infra/colors";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { AmountMeasurePredicate, WonMeasurePredicate } from "../../_infra/predicates";
import { replaceMappingPredicates } from "../_infra/insightConverters";

const colorsAndPalette = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", ComboChartWithArithmeticMeasuresAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to measures",
        {
            ...ComboChartWithArithmeticMeasuresAndViewBy,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: AmountMeasurePredicate,
                        color: BlackColor,
                    },
                    {
                        predicate: WonMeasurePredicate,
                        color: CustomPaletteColor,
                    },
                ],
            },
        },
        m => m.withInsightConverter(replaceMappingPredicates(ReferenceLdm.Amount, ReferenceLdm.Won)),
    );

export default [colorsAndPalette, colorAssignment];
