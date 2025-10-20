// src/sanity/live.ts
import { createClient, type QueryParams, type RequestOptions } from "@sanity/client";
import { env } from "./env";

type NextFetchOptions = {
    next?: { revalidate?: number | false; tags?: string[] };
    cache?: RequestCache; // built-in TS type
};

export const client = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION!,
    useCdn: true,
});

// Write client for API routes (server-side only)
export const writeClient = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION!,
    useCdn: false,
    token: env.SANITY_API_WRITE_TOKEN,
});

export async function sanityFetch<T>(
    query: string,
    params: QueryParams = {},
    options?: RequestOptions & NextFetchOptions
) {
    const data = await client.fetch<T>(query, params, options);
    return { data };
}

export function SanityLive() {
    // If you're using next-sanity live features, render whatever it requires.
    // For many setups this can be an empty boundary or provider.
    return null;
}
