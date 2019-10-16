// (C) 2007-2019 GoodData Corporation
import { loadProjectMetadata } from "../../loaders/loadProjectMetadata";
import { transformToCatalog } from "../toCatalog";

jest.mock("@gooddata/gd-bear-client");

describe("transformToCatalog", () => {
    const projectMeta = loadProjectMetadata("test");

    it("creates new catalog", async () => {
        expect(transformToCatalog(await projectMeta)).toMatchSnapshot();
    });

    it("merges existing catalog", async () => {
        const existingCatalog = {
            projectId: "test",
            attributes: {
                "Renamed Channel": {
                    identifier: "attr.orders.channel",
                    tags: "",
                    displayForms: {
                        "Renamed Channel Df": {
                            identifier: "label.orders.channel",
                            tags: "",
                        },
                    },
                },
            },
            visualizations: {
                "My Renamed Total Sales By Location": {
                    identifier: "aaBN5UG3dXu4",
                    tags: "",
                },
                // this results in a merge conflict. the new catalog HAS item with
                // different identifier AND the same name
                "Total Sales by City": {
                    identifier: "abhJpedgcfU2",
                    tags: "",
                },
            },
        };

        expect(transformToCatalog(await projectMeta, existingCatalog)).toMatchSnapshot();
    });
});
