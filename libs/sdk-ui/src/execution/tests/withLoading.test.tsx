// (C) 2019 GoodData Corporation
import * as React from "react";
import { withLoading, IWithLoading, WithLoadingResult } from "../withLoading";
import { shallow } from "enzyme";
import { IDummyPromise, createDummyPromise } from "../../base/react/tests/toolkit";
import { DataViewFacade } from "../../base";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { emptyDef } from "@gooddata/sdk-model";

const EmptyDataViewFacade = DataViewFacade.for(dummyDataView(emptyDef("testWorkspace")));

const renderEnhancedComponent = <T, E>(
    promiseConfig: IDummyPromise<DataViewFacade, E>,
    hocConfig?: Omit<IWithLoading<T>, "promiseFactory">,
) => {
    const promiseFactory = (_props?: T) => createDummyPromise(promiseConfig);

    const CoreComponent: React.FC<WithLoadingResult> = props => {
        const { result, error, reload, isLoading } = props;
        return (
            <div>
                <button className="Refetch" onClick={reload} />
                {isLoading && <div className="Loading" />}
                {result && <div className="Result">{result}</div>}
                {error && <div className="Error">{error.message}</div>}
            </div>
        );
    };

    const Component: any = withLoading({
        ...hocConfig,
        promiseFactory,
    })(CoreComponent as any);

    return shallow(<Component />);
};

describe("withLoading", () => {
    const RESULT = EmptyDataViewFacade;
    const ERROR = new Error("ERROR");

    it("should start loading immediately and inject isLoading prop", () => {
        const wrapper = renderEnhancedComponent({ result: RESULT, delay: 100 });
        expect(wrapper.prop("isLoading")).toBe(true);
    });

    it("should not start loading immediately if loadOnMount is set to false", () => {
        const wrapper = renderEnhancedComponent({ result: RESULT, delay: 100 }, { loadOnMount: false });
        expect(wrapper.prop("isLoading")).toBe(false);
    });

    it("should stop loading when promise is resolved and inject result prop", async done => {
        const wrapper = renderEnhancedComponent({ result: RESULT, delay: 100 });
        await createDummyPromise({ delay: 150 });
        expect(wrapper.prop("isLoading")).toBe(false);
        expect(wrapper.prop("result")).toBe(RESULT);
        done();
    });

    it("should stop loading when promise is rejected and inject error prop", async done => {
        const wrapper = renderEnhancedComponent({ willResolve: false, error: ERROR, delay: 100 });
        await createDummyPromise({ delay: 150 });
        expect(wrapper.prop("isLoading")).toBe(false);
        expect(wrapper.prop("error").cause).toBe(ERROR);
        done();
    });

    it("should inject fetch handler", () => {
        const wrapper = renderEnhancedComponent({ delay: 100 });
        expect(wrapper.prop("reload")).toEqual(expect.any(Function));
    });

    it("should start loading again after invoking injected fetch function", async done => {
        const wrapper = renderEnhancedComponent({ delay: 100 });
        await createDummyPromise({ delay: 150 });
        wrapper
            .dive()
            .find(".Refetch")
            .simulate("click");

        expect(wrapper.prop("isLoading")).toBe(true);
        done();
    });

    it("should invoke onLoadingStart, onLoadingChanged and onLoadingFinish events", async done => {
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onLoadingFinish = jest.fn();

        renderEnhancedComponent(
            { delay: 100 },
            {
                events: {
                    onLoadingChanged,
                    onLoadingFinish,
                    onLoadingStart,
                },
            },
        );

        await createDummyPromise({ delay: 150 });

        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onLoadingFinish).toBeCalledTimes(1);
        done();
    });

    it("should invoke onLoadingStart, onLoadingChanged and onError events", async done => {
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();

        renderEnhancedComponent(
            { willResolve: false, delay: 100 },
            {
                events: {
                    onError,
                    onLoadingChanged,
                    onLoadingStart,
                },
            },
        );

        await createDummyPromise({ delay: 150 });

        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onError).toBeCalledTimes(1);
        done();
    });
});
