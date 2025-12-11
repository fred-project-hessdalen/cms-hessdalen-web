// Query for active recommendations
import { z } from "zod";
import { defineQuery } from "next-sanity";

/** ── GROQ ─────────────────────────────────────────────────────────────── */

const RECOMMENDATION_FIELDS = `
  _id,
  title,
  link,
  expiresAt,
  person->{
    _id,
    name,
    displayName,
    image{
      asset->{url}
    }
  }
`;

export const ACTIVE_RECOMMENDATIONS_QUERY = defineQuery(`
  *[_type == "recommendation" && (!defined(expiresAt) || expiresAt > now())] | order(expiresAt asc) {
    ${RECOMMENDATION_FIELDS}
  }
`);

/** ── Zod ──────────────────────────────────────────────────────────────── */

const Person = z.object({
    _id: z.string(),
    name: z.string().optional().nullable(),
    displayName: z.string().optional().nullable(),
    image: z.object({
        asset: z.object({
            url: z.string().optional().nullable(),
        }).optional().nullable(),
    }).optional().nullable(),
}).optional().nullable();

export const Recommendation = z.object({
    _id: z.string(),
    title: z.string(),
    link: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    person: Person,
});

export const RecommendationList = z.array(Recommendation);

/** ── Types ────────────────────────────────────────────────────────────── */

export type RecommendationType = z.infer<typeof Recommendation>;
export type RecommendationListType = z.infer<typeof RecommendationList>;
