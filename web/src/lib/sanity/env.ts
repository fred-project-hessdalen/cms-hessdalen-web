import { z } from "zod";

const Env = z.object({
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string(),
    NEXT_PUBLIC_SANITY_DATASET: z.string(),
    NEXT_PUBLIC_SANITY_API_VERSION: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    SANITY_API_READ_TOKEN: z.string().optional(),
});

export const env = Env.parse(process.env);
