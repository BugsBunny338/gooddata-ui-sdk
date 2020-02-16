// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";

export const AreaChartWithViewBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
};

export const AreaChartWithViewAndStackBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
    stackBy: ReferenceLdm.Region,
};

export const AreaChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name],
};

export const AreaChartViewByDate = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.ClosedYear],
};

export default scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure with viewBy", AreaChartWithViewBy)
    .addScenario("single measure with viewBy and stackBy", AreaChartWithViewAndStackBy)
    .addScenario("single measure with two viewBy", {
        measures: [ReferenceLdm.Amount],
        viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
    })
    .addScenario("two measures with viewBy", AreaChartWithTwoMeasuresAndViewBy)
    .addScenario("two measures with undefined values", AreaChartViewByDate)
    .addScenario("two measures with viewBy sorted by attribute", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name, "desc")],
    })
    .addScenario("two measures with viewBy sorted by measure", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newMeasureSort(ReferenceLdm.Won, "asc")],
    })
    .addScenario("arithmetic measures", {
        measures: [
            ReferenceLdm.Amount,
            ReferenceLdm.Won,
            ReferenceLdmExt.CalculatedLost,
            ReferenceLdmExt.CalculatedWonLostRatio,
        ],
        viewBy: [ReferenceLdm.Product.Name],
    });
