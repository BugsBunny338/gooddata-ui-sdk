// (C) 2007-2018 GoodData Corporation
import * as HttpStatusCodes from "http-status-codes";
import { convertErrors, generateErrorMap } from "../errorHandlers";
import { ApiResponseError } from "@gooddata/gd-bear-client";
import "isomorphic-fetch";

import { ErrorCodes, ErrorStates } from "../../constants/errorStates";
import { RuntimeError } from "../../errors/RuntimeError";
import "jest";

async function createMockedError(status: number, body: string = "{}") {
    const response = new Response(body, { status });

    // In gooddata-js, the response body is always read before the rejectio with ApiResponseError,
    // see https://github.com/gooddata/gooddata-js/blob/c5c985e9070d20ac359b988244b7bb1155661473/src/xhr.ts#L154-L155
    const responseBody = await response.text();

    return new ApiResponseError("Response error", response, responseBody);
}

async function createTypeError() {
    return new TypeError("TypeError message");
}

describe("convertErrors", () => {
    it("should return RuntimeError with message when error type is not ApiResponseError", async () => {
        const e = convertErrors(await createTypeError());

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual("TypeError message");
    });

    it("should return `NO_DATA` error", async () => {
        const e = convertErrors(await createMockedError(204));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.NO_DATA);
    });

    it("should return `DATA_TOO_LARGE_TO_COMPUTE` error", async () => {
        const e = convertErrors(await createMockedError(HttpStatusCodes.REQUEST_TOO_LONG));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);
    });

    it("should return `BAD_REQUEST` error", async () => {
        const e = convertErrors(await createMockedError(HttpStatusCodes.BAD_REQUEST));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.BAD_REQUEST);
    });

    it("should return `UNAUTHORIZED` error", async () => {
        const e = convertErrors(await createMockedError(HttpStatusCodes.UNAUTHORIZED));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.UNAUTHORIZED);
    });

    it("should return `NOT_FOUND` error", async () => {
        const e = convertErrors(await createMockedError(HttpStatusCodes.NOT_FOUND));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.NOT_FOUND);
    });

    it("should return `PROTECTED_REPORT` error", async () => {
        const protectedErrorBody = `{
                "error": {
                    "message": "Attempt to execute protected report unsafely"
                }
            }`;

        const e = convertErrors(await createMockedError(HttpStatusCodes.BAD_REQUEST, protectedErrorBody));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.PROTECTED_REPORT);
    });

    it("should return `EMPTY_AFM` error", async () => {
        const e = convertErrors(await createMockedError(ErrorCodes.EMPTY_AFM));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.EMPTY_AFM);
    });

    it("should return `INVALID_BUCKETS` error", async () => {
        const e = convertErrors(await createMockedError(ErrorCodes.INVALID_BUCKETS));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.INVALID_BUCKETS);
    });

    it("should return `UNKNOWN_ERROR` error", async () => {
        const e = convertErrors(await createMockedError(0));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.UNKNOWN_ERROR);
    });
});

describe("generateErrorMap", () => {
    it("should generate map", () => {
        const intlMock = {
            formatMessage: ({ id }: { id: string }) => id,
        };
        const map = generateErrorMap(intlMock as any);
        expect(map).toMatchSnapshot();
    });
});
