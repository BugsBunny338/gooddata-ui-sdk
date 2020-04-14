// (C) 2019-2020 GoodData Corporation
import { GdcMetadata, GdcMetadataObject } from "@gooddata/gd-bear-model";
import {
    uriRef,
    MetadataObject,
    newAttributeMetadataObject,
    newAttributeDisplayFormMetadataObject,
    newFactMetadataObject,
    IMetadataObjectBuilder,
    newMeasureMetadataObject,
    IMetadataObject,
    ObjectType,
} from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

export const convertMetadataObject = (obj: GdcMetadataObject.IObject): MetadataObject => {
    const ref = uriRef(obj.meta.uri);

    const commonModifications = <T extends IMetadataObjectBuilder>(builder: T) =>
        builder
            .title(obj.meta.title)
            .description(obj.meta.summary)
            .id(obj.meta.identifier)
            .uri(obj.meta.uri);

    if (GdcMetadata.isAttribute(obj)) {
        return newAttributeMetadataObject(ref, a => a.modify(commonModifications));
    } else if (GdcMetadata.isAttributeDisplayForm(obj)) {
        return newAttributeDisplayFormMetadataObject(ref, a =>
            a.modify(commonModifications).attribute(uriRef(obj.content.formOf)),
        );
    } else if (GdcMetadata.isMetric(obj)) {
        return newMeasureMetadataObject(ref, m =>
            m
                .modify(commonModifications)
                .expression(obj.content.expression)
                .format(obj.content.format || "##,#"),
        );
    } else if (GdcMetadata.isFact(obj)) {
        return newFactMetadataObject(ref, f => f.modify(commonModifications));
    }

    throw new UnexpectedError(
        `Cannot convert metadata object, convertor not found! (${JSON.stringify(obj, null, 4)})`,
    );
};

/**
 * Converts xref entry (result of using/usedBy) into IMetadataObject. There's one gotcha: the production indicator
 * is not available in xref entry. Instead of calling out to the backend, this function will hammer in 'true' - which
 * will be right guess in vast majority of cases (hunt me down when this starts causing bugs :)).
 *
 * @param type - specify object type of the xref entry (code ignores the xref category)
 * @param entry - xref entry
 */
export const convertMetadataObjectXrefEntry = (
    type: ObjectType,
    entry: GdcMetadata.IObjectXrefEntry,
): IMetadataObject => {
    const ref = uriRef(entry.link);

    return {
        type,
        uri: entry.link,
        id: entry.identifier,
        ref,
        title: entry.title,
        description: entry.summary,
        production: true,
    };
};
