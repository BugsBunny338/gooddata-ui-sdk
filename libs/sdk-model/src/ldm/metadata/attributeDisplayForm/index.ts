// (C) 2019-2020 GoodData Corporation
import invariant from "ts-invariant";
import { ObjRef } from "../../../objRef";
import { IMetadataObject } from "../types";

/**
 * Attribute display form metadata object
 *
 * @public
 */
export interface IAttributeDisplayFormMetadataObject extends IMetadataObject {
    type: "displayForm";

    /**
     * A reference to the attribute that displayForm represents
     */
    attribute: ObjRef;
}

/**
 * Gets the attribute display form's ObjRef
 * @param displayForm - attribute display form to work with
 * @returns ObjRef of the attribute display form
 * @public
 */
export function attributeDisplayFormRef(displayForm: IAttributeDisplayFormMetadataObject): ObjRef {
    invariant(displayForm, "displayForm must not be undefined");

    return displayForm.ref;
}

/**
 * Gets the attribute display form's title.
 * @param displayForm - attribute display form to work with
 * @returns title of the attribute display form
 * @public
 */
export function attributeDisplayFormTitle(displayForm: IAttributeDisplayFormMetadataObject): string {
    invariant(displayForm, "displayForm must not be undefined");

    return displayForm.title;
}

/**
 * Gets ObjRef of the attribute the display form is a form of.
 *
 * @param displayForm - attribute display form to work with
 * @returns display form ObjRef
 * @public
 */
export function attributeDisplayFormAttributeRef(displayForm: IAttributeDisplayFormMetadataObject): ObjRef {
    invariant(displayForm, "displayForm must not be undefined");

    return displayForm.attribute;
}
