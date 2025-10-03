// src/sanity/client.ts (public reads)
import { env } from "@/lib/sanity/env";
import { createClient } from "next-sanity";

export const publicClient = createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: true, // good for public/prod reads
});
