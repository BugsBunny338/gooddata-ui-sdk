// (C) 2007-2019 GoodData Corporation
import { IPieChartProps, PieChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { BlackColor, CustomColorPalette, CustomPaletteColor, RedColor } from "../../_infra/colors";
import { AmountMeasurePredicate, AttributeElements, WonMeasurePredicate } from "../../_infra/predicates";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { PieChartWithSingleMeasureAndViewBy, PieChartWithTwoMeasures } from "./base";
import { replaceMappingPredicates } from "../_infra/insightConverters";
import { Product } from "../../_infra/data";
import { ReferenceLdm } from "@gooddata/reference-workspace";

const colorsAndPalette = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", PieChartWithSingleMeasureAndViewBy, coloringCustomizer);

const colorAssignment = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario(
        "assign color to measures",
        {
            ...PieChartWithTwoMeasures,
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
    )
    .addScenario(
        "assign color to attributes",
        {
            ...PieChartWithSingleMeasureAndViewBy,
            config: {
                colorPalette: CustomColorPalette,
                colorMapping: [
                    {
                        predicate: AttributeElements.Product.WonderKid,
                        color: BlackColor,
                    },
                    {
                        predicate: AttributeElements.Product.Explorer,
                        color: RedColor,
                    },
                ],
            },
        },
        m => m.withInsightConverter(replaceMappingPredicates(Product.WonderKid, Product.Explorer)),
    );

export default [colorsAndPalette, colorAssignment];
