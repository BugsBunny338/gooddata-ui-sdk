// (C) 2019-2020 GoodData Corporation
import { Velocity, Won } from "../../../../__mocks__/model";
import { newPositiveAttributeFilter } from "../../filter/factory";
import {
    modifyMeasure,
    modifySimpleMeasure,
    newArithmeticMeasure,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
} from "../factory";
import { measureLocalId } from "../index";
import { idRef } from "../../../objRef/factory";

describe("measure factories", () => {
    describe("newMeasure", () => {
        it("should return a simple measure", () => {
            expect(newMeasure("foo")).toMatchSnapshot();
        });
        it("should return a simple measure with different aggregation", () => {
            expect(newMeasure("foo", m => m.aggregation("sum"))).toMatchSnapshot();
        });
        it("should honor custom-set localId for simple measures with aggregation", () => {
            expect(newMeasure("foo", m => m.localId("bar").aggregation("sum"))).toMatchSnapshot();
        });
        it("should return a measure with alias", () => {
            expect(newMeasure("foo", m => m.alias("bar"))).toMatchSnapshot();
        });
        it("should return a measure with custom localIdentifier", () => {
            expect(newMeasure("foo", m => m.localId("custom"))).toMatchSnapshot();
        });
        it("should return a measure with format", () => {
            expect(newMeasure("foo", m => m.format("bar"))).toMatchSnapshot();
        });
        it("should return a measure with title", () => {
            expect(newMeasure("foo", m => m.title("bar"))).toMatchSnapshot();
        });
        it("should return a measure with a filter", () => {
            expect(
                newMeasure("foo", m => m.filters(newPositiveAttributeFilter("filter", { uris: ["baz"] }))),
            ).toMatchSnapshot();
        });
    });

    describe("modifyMeasure", () => {
        const ExistingMeasure = newMeasure("measure1", m => m.localId("measure1"));

        it("should not modify input measure", () => {
            modifyMeasure(ExistingMeasure, m => m.localId("measure2"));

            expect(measureLocalId(ExistingMeasure)).toEqual("measure1");
        });

        it("should generate new local id when not explicitly specified", () => {
            const newMeasure = modifyMeasure(ExistingMeasure);

            expect(measureLocalId(ExistingMeasure)).not.toEqual(measureLocalId(newMeasure));
        });

        it("should create new measure with modified local id", () => {
            expect(modifyMeasure(ExistingMeasure, m => m.localId("measure2"))).toMatchSnapshot();
        });
    });

    describe("modifySimpleMeasure", () => {
        const ExistingMeasure = newMeasure("measure1", m => m.localId("measure1"));
        const ExistingMeasureWithCustomizations = newMeasure("measure1", m =>
            m
                .localId("measure1")
                .alias("alias")
                .format("format")
                .title("title"),
        );

        it("should create new measure with modified aggregation and generated local id", () => {
            expect(modifySimpleMeasure(ExistingMeasure, m => m.aggregation("min"))).toMatchSnapshot();
        });

        it("should create new measure with modified aggregation and custom local id", () => {
            expect(
                modifySimpleMeasure(ExistingMeasure, m => m.aggregation("min").localId("customLocalId")),
            ).toMatchSnapshot();
        });

        it("should create new measure with cleaned up customizations", () => {
            const result = modifySimpleMeasure(ExistingMeasureWithCustomizations, m =>
                m
                    .defaultFormat()
                    .noAlias()
                    .noTitle(),
            );

            expect(result).toMatchSnapshot();
        });
    });

    describe("newArithmeticMeasure", () => {
        it("should return a simple arithmetic measure", () => {
            expect(newArithmeticMeasure(["foo", "bar"], "sum")).toMatchSnapshot();
        });

        it("should return a simple arithmetic measure from two measure objects", () => {
            expect(newArithmeticMeasure([Won, Velocity.Min], "sum")).toMatchSnapshot();
        });
    });

    describe("newPopMeasure", () => {
        it("should return a simple PoP measure from shorthand attribute identifier", () => {
            expect(newPopMeasure("foo", "attr")).toMatchSnapshot();
        });

        it("should return a simple PoP measure from attribute ref", () => {
            expect(newPopMeasure("foo", idRef("attr"))).toMatchSnapshot();
        });

        it("should return a simple PoP measure from other measure object", () => {
            expect(newPopMeasure(Won, "attr")).toMatchSnapshot();
        });
    });

    describe("newPreviousPeriodMeasure", () => {
        it("should return a simple PP measure when supplied with strings", () => {
            expect(newPreviousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }])).toMatchSnapshot();
        });

        it("should return a simple PP measure when supplied with objects", () => {
            expect(newPreviousPeriodMeasure(Won, [{ dataSet: "bar", periodsAgo: 3 }])).toMatchSnapshot();
        });
    });
});
