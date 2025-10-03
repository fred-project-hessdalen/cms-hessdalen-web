import { z } from "zod";
import { defineQuery } from "next-sanity";
import type { PortableTextBlock } from "sanity";

/** ── GROQ ─────────────────────────────────────────────────────────────── */

const NEWS_FIELDS = `
  _id,
  _type,
  title,
  "slug": slug.current,
  mainImage{
    asset->{url},
    alt
  },
  originalArticleUrl,
  summary[]{ ... },
  body[]{
  ...,
  asset->{url},
  images[]{asset->{url}, alt, caption}
},
  authors[]{
    role,
    note,
    person->{name, image}
  },
  originalPublishedDate,
  publishedHereDate,
  categories,
  originCountry
`;

export const NEWS_LIST_QUERY = defineQuery(`
  *[_type == "news"] | order(publishedHereDate desc, originalPublishedDate desc) {
    ${NEWS_FIELDS}
  }
`);

export const LATEST_NEWS_LIST_QUERY = `
*[_type == "news"] | order(publishedHereDate desc)[0...4] {
  ${NEWS_FIELDS}
}
`;


export const NEWS_BY_SLUG_QUERY = defineQuery(`
  *[_type == "news" && slug.current == $slug][0]{
    ${NEWS_FIELDS}
  }
`);

/** ── Zod ──────────────────────────────────────────────────────────────── */

const zStrOpt = z.preprocess(v => (v ?? undefined), z.string().optional());
const zUrlOpt = z.preprocess(v => (v ?? undefined), z.string().url().optional());
const zArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess(v => (v == null ? [] : v), z.array(item));

// MainImage type
const MainImage = z.object({
  asset: z.object({ url: zUrlOpt }),
  alt: zStrOpt,
});

// Author (credit object)
const Author = z.object({
  role: zStrOpt,
  note: zStrOpt.optional(),
  person: z.object({
    name: zStrOpt,
    image: z.any().optional(),
  }).optional(),
});

export const News = z.object({
  _id: z.string(),
  _type: z.literal("news"),
  title: z.string().min(1),
  slug: z.string().min(1),
  mainImage: MainImage.optional().nullable(),
  originalArticleUrl: zUrlOpt,
  summary: zArray(z.unknown()), // Accept any block for now
  // summary: zArray(z.object({
  //     _key: z.string(),
  //     _type: z.string(),
  //     children: z.array(z.object({
  //         _key: z.string(),
  //         _type: z.string(),
  //         text: z.string(),
  //         marks: z.array(z.string()).optional(),
  //     })).optional(),
  //     style: z.string().optional(),
  //     markDefs: z.array(z.unknown()).optional(),
  //     listItem: z.string().optional(),
  //     level: z.number().optional(),
  // })),
  body: zArray(z.unknown()), // Accept any block for now
  authors: zArray(Author),
  originalPublishedDate: zStrOpt,
  publishedHereDate: zStrOpt,
  categories: zArray(z.string()),
  originCountry: zStrOpt,
});

// TypeScript-only override for PortableText
export type NewsType = Omit<z.infer<typeof News>, "summary" | "body"> & {
  summary: PortableTextBlock[];
  body: PortableTextBlock[];
};

export const NewsList = z.array(News);
export type NewsListType = NewsType[];
