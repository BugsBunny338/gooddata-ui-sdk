// (C) 2019-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IAttributeMetadataObject } from "../../metadata/attribute";
import { IAttributeDisplayFormMetadataObject } from "../../metadata/attributeDisplayForm";
import { IGroupableCatalogItemBase } from "../group";

/**
 * Type representing catalog attribute
 *
 * @public
 */
export interface ICatalogAttribute extends IGroupableCatalogItemBase {
    /**
     * Catalog item type
     */
    type: "attribute";

    /**
     * Attribute metadata object that catalog attribute represents
     */
    attribute: IAttributeMetadataObject;

    /**
     * Default display form of the attribute
     */
    defaultDisplayForm: IAttributeDisplayFormMetadataObject;
}

/**
 * Type guard checking whether the provided object is a {@link ICatalogAttribute}
 *
 * @public
 */
export function isCatalogAttribute(obj: any): obj is ICatalogAttribute {
    return !isEmpty(obj) && (obj as ICatalogAttribute).type === "attribute";
}
