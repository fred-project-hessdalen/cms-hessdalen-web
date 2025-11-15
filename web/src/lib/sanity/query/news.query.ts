// Search query for news
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
    _type == "imageBlock" => {
      ...,
      asset->{url},
      link
    },
    images[]{
      ...,
      asset->{url},
      description[]{ ... },
      caption,
      credit,
      link
    },
    _type == "imageList" => {
      ...,
      description[]{ ... },
      highlight,
      aspect,
      items[]{
        title,
        description[]{ ... },
        link,
        "icon": {
          "url": icon.asset->url
        }
      }
    },
    _type == "partsList" => {
      ...,
      description[]{ ... },
      highlight,
      items[]->{
        _id,
        name,
        title,
        description[]{ ... },
        "image": {
          "url": image.asset->url,
          "alt": image.alt
        },
        aspect,
        imageURL,
        buttons[]{
          name,
          url,
          style
        },
        align,
        layout
      }
    },
    _type == "textColumns" => {
      ...,
      content[]{
        ...,
        _type == "image" => {
          ...,
          asset->{url}
        }
      }
    },
    _type == "collapsible" => {
      ...,
      content[]{
        ...,
        _type == "imageBlock" => {
          ...,
          asset->{url}
        }
      }
    }
  },
  authors[]{
    role->{
      _id,
      title,
      "slug": slug.current,
      category
    },
    note,
    person->{name, image}
  },
  originalPublishedDate,
  publishedHereDate,
  categories[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    color
  },
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

export const NEWS_SEARCH_QUERY = defineQuery(`
  *[_type == "news" && (title match $q || summary[].children[].text match $q || body[].children[].text match $q)] | order(publishedHereDate desc)[0...10] {
    ${NEWS_FIELDS}
  }
`);

export const NEWS_BY_TAG_QUERY = `
  *[_type == "news" && references(*[_type == "category" && slug.current == $tag][0]._id)] | order(publishedHereDate desc)[0...50] {
    ${NEWS_FIELDS}
  }
`;
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
  role: z.preprocess(
    (val) => val ?? undefined,
    z.object({
      _id: z.string(),
      title: z.string(),
      slug: z.string(),
      category: zStrOpt,
    }).optional()
  ),
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
  summary: zArray(z.any()), // Accept any block for now
  body: zArray(z.any()), // Accept any block for now
  authors: zArray(Author),
  originalPublishedDate: zStrOpt,
  publishedHereDate: zStrOpt,
  categories: z.preprocess(
    (val) => Array.isArray(val) ? val.filter(Boolean) : [],
    zArray(z.object({
      _id: z.string(),
      title: z.string(),
      slug: z.string(),
      description: zStrOpt,
      color: zStrOpt,
    }))
  ),
  originCountry: zStrOpt,
});

// TypeScript-only override for PortableText
export type NewsType = Omit<z.infer<typeof News>, "summary" | "body"> & {
  summary: PortableTextBlock[];
  body: PortableTextBlock[];
};

export const NewsList = z.array(News);
export type NewsListType = NewsType[];
