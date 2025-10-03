// src/sanity/fetchAndParse.ts
import { z, ZodTypeAny } from "zod";
import { sanityFetch } from "./live";
import type { QueryParams, RequestOptions } from "@sanity/client";

type NextFetchOptions = {
    next?: { revalidate?: number | false; tags?: string[] };
    cache?: RequestCache;
};

export async function fetchAndParse<TSchema extends ZodTypeAny>(
    query: string,
    params: QueryParams = {},
    schema: TSchema,
    options?: RequestOptions & NextFetchOptions
): Promise<z.infer<TSchema>> {
    const { data } = await sanityFetch<unknown>(query, params, options);
    return schema.parse(data);
}
