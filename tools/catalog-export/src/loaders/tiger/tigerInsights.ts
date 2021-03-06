// (C) 2007-2020 GoodData Corporation

import { ObjectMeta } from "../../base/types";
import { ITigerClient, VisualizationObjectCollection } from "@gooddata/api-client-tiger";

/**
 * Load insights that are stored in workspace metadata so that their links can be included
 * in the generated output for easy embedding access.
 *
 * @param _projectId - project id, ignored for now as tiger is single-workspace
 * @param tigerClient - tiger client to use for communication
 */
export async function loadInsights(_projectId: string, tigerClient: ITigerClient): Promise<ObjectMeta[]> {
    const result = await tigerClient.workspaceModel.getEntities(
        {
            entity: "visualizationObjects",
            workspaceId: _projectId,
        },
        {
            headers: { Accept: "application/vnd.gooddata.api+json" },
        },
    );

    return (result.data as VisualizationObjectCollection).data.map((vis) => {
        return {
            title: vis.attributes?.title ?? vis.id,
            identifier: vis.id,
            tags: vis.attributes?.tags?.join(",") ?? "",
        };
    });
}
