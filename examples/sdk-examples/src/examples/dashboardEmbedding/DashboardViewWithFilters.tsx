// (C) 2007-2018 GoodData Corporation
import React from "react";
import { DashboardView } from "@gooddata/sdk-ui-ext/esm/internal";
import { idRef, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { Ldm } from "../../ldm";
import { MAPBOX_TOKEN } from "../../constants/fixtures";

const dashboardRef = idRef("aeO5PVgShc0T");
const filters = [newPositiveAttributeFilter(Ldm.LocationState, { values: ["California"] })];
const config = { mapboxToken: MAPBOX_TOKEN };

const DashboardViewWithFilters: React.FC = () => {
    return <DashboardView dashboard={dashboardRef} filters={filters} config={config} />;
};

export default DashboardViewWithFilters;
