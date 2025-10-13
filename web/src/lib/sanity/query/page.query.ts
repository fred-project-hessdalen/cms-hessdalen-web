// ...existing code...

// ...existing code...

// Helper declarations (zStrOpt, zUrlOpt, zArray, MainImage, Author) come first
// ...existing code...

import { z } from "zod";
import { defineQuery } from "next-sanity";
import type { PortableTextBlock } from "sanity";

/** ── GROQ ─────────────────────────────────────────────────────────────── */



const PAGE_FIELDS = `
  _id,
  _type,
  title,
  path,
  mainImage{
    asset->{url},
    alt,
    layout
  },
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
        _type == "image" => {
          ...,
          asset->{url}
        }
      }
    }
  },
  authors[]{
    role,
    note,
    person->{name, image}
  },
  publishedDate,
  categories,
  originCountry
`;

export const PAGE_BY_PATH_QUERY = defineQuery(`
  *[_type == "page" && path == $path][0] {
    ${PAGE_FIELDS}
  }
`);

export const PAGE_SEARCH_QUERY = defineQuery(`
  *[_type == "page" && (title match $q || summary[].children[].text match $q || body[].children[].text match $q)] | order(publishedDate desc)[0...10] {
    ${PAGE_FIELDS}
  }
`);

export const PAGE_ALL_QUERY = defineQuery(`
  *[_type == "page"] | order(path asc) {
    ${PAGE_FIELDS}
  }
`);
/** ── Zod ──────────────────────────────────────────────────────────────── */

const zStrOpt = z.preprocess(v => (v ?? undefined), z.string().optional());
const zUrlOpt = z.preprocess(v => (v ?? undefined), z.string().url().optional());
const zArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess(v => (v == null ? [] : v), z.array(item));

const MainImage = z.object({
  asset: z.object({ url: zUrlOpt }).optional().nullable(),
  alt: zStrOpt,
  layout: zStrOpt,
});

const Author = z.object({
  role: zStrOpt,
  note: zStrOpt.optional(),
  person: z.object({
    name: zStrOpt,
    image: z.any().optional(),
  }).optional(),
});

export const Page = z.object({
  _id: z.string(),
  _type: z.literal("page"),
  title: z.string().min(1),
  path: z.string().min(1),
  mainImage: MainImage.optional().nullable(),
  summary: zArray(z.any()),
  body: zArray(z.any()),
  authors: zArray(Author),
  publishedDate: zStrOpt,
  categories: zArray(z.string()),
  originCountry: zStrOpt,
});


export type PageType = Omit<z.infer<typeof Page>, "summary" | "body"> & {
  summary: PortableTextBlock[];
  body: PortableTextBlock[];
};


export const PageList = z.array(Page);
export type PageListType = PageType[];