// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui";
import {
    BarChartWithSingleMeasureAndTwoViewByAndStack,
    BarChartWithSingleMeasureAndViewBy,
    BarChartWithTwoMeasuresAndTwoViewBy,
} from "./base";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { AttributeElements } from "../../_infra/predicates";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("single measure and viewBy with drilling on bars", {
        ...BarChartWithSingleMeasureAndViewBy,
        drillableItems: [AttributeElements.Product.Explorer, AttributeElements.Product.WonderKid],
    })
    .addScenario("single measure and two viewBy with drilling on parent attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
    })
    .addScenario("force disable drill on axes", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
        config: {
            forceDisableDrillOnAxes: true,
        },
    })
    .addScenario("single measure and two viewBy with drilling on child attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Region.EastCoast],
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on child attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Region.EastCoast],
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceLdm.Won)],
            },
        },
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on parent attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer],
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceLdm.Won)],
            },
        },
    })
    .addScenario("two measures and two viewBy, dual axis, with drilling on parent and child attribute", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        drillableItems: [AttributeElements.Product.Explorer, AttributeElements.Region.EastCoast],
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceLdm.Won)],
            },
        },
    })
    .addScenario("single measure, two viewBy and stacking with drilling on parent", {
        ...BarChartWithSingleMeasureAndTwoViewByAndStack,
        drillableItems: [AttributeElements.Product.Explorer],
    });
