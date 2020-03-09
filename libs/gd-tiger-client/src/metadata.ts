// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import { DefaultApi, DefaultApiInterface } from "./generated";

export const tigerMetadataClientFactory = (axios: AxiosInstance): DefaultApiInterface =>
    new DefaultApi({}, "/api/metadata", axios);
