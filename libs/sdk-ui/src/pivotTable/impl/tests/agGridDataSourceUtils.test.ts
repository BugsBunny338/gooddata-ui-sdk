// (C) 2019-2020 GoodData Corporation
import { areTotalsChanged, isInvalidGetRowsRequest } from "../agGridDataSourceUtils";
import { IGridTotalsRow } from "../agGridTypes";

describe("getGridDataSourceUtils", () => {
    describe("isInvalidGetRowsRequest", () => {
        function mockGridApi(bottomRowIndex: number | null): any {
            return {
                paginationProxy: {
                    bottomRowBounds: {
                        rowIndex: bottomRowIndex,
                    },
                },
            };
        }

        it("should return false is bottom row index is null", () => {
            const startRow = 0;
            const bottomRowIndex: null = null;
            const gridApi = mockGridApi(bottomRowIndex);

            expect(isInvalidGetRowsRequest(startRow, gridApi)).toEqual(false);
        });

        it("should return false is start row of request is below bottom row index", () => {
            const startRow = 0;
            const bottomRowIndex = 1;
            const gridApi = mockGridApi(bottomRowIndex);

            expect(isInvalidGetRowsRequest(startRow, gridApi)).toEqual(false);
        });

        it("should return true is start row of request is above bottom row index", () => {
            const startRow = 1;
            const bottomRowIndex = 0;
            const gridApi = mockGridApi(bottomRowIndex);

            expect(isInvalidGetRowsRequest(startRow, gridApi)).toEqual(true);
        });
    });

    describe("areTotalsChanged", () => {
        function mockGridApi(totals: any[] = []): any {
            return {
                getPinnedBottomRowCount: () => totals.length,
                getPinnedBottomRow: (i: number) => ({ data: totals[i] }),
            };
        }
        const totalSum = {
            type: "rowTotal",
            colSpan: {
                count: 1,
                headerKey: "foo",
            },
        };
        const emptyTotalRows: IGridTotalsRow[] = [];
        const noTotalRows: IGridTotalsRow[] = null;
        const oneTotalRows: IGridTotalsRow[] = [totalSum];

        it.each([
            [true, "no", "one", noTotalRows, [totalSum]],
            [false, "no", "no", noTotalRows, []],
            [true, "empty", "one", emptyTotalRows, [totalSum]],
            [false, "empty", "no", emptyTotalRows, []],
            [true, "one", "no", oneTotalRows, []],
            [false, "one", "one", oneTotalRows, [totalSum]],
        ])(
            "should return %s when %s total passed and %s total present in bottom pinned row",
            (
                expectedValue: boolean,
                _passed: string,
                _table: string,
                passedTotals: any[],
                tableTotals: any[],
            ) => {
                const gridApi = mockGridApi(tableTotals);

                expect(areTotalsChanged(gridApi, passedTotals)).toBe(expectedValue);
            },
        );
    });
});
