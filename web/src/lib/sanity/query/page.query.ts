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
  hidden,
  path,
  redirectTo,
  mainImage{
    asset->{url},
    alt,
    layout
  },
  summary[]{ ... },
  partsBeforeContent[]->{
    _id,
    name,
    title,
    description[]{ ... },
    image{
      "url": asset->url,
      alt
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
  },
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
      items[]{
        title,
        description[]{ ... },
        link,
        "icon": {
          "url": icon.asset->url
        }
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
        _type == "image" => {
          ...,
          asset->{url}
        }
      }
    }
  },
  partsAfterContent[]->{
    _id,
    name,
    title,
    description[]{ ... },
    image{
      "url": asset->url,
      alt
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

const PartButton = z.object({
  name: z.string(),
  url: z.string(),
  style: z.enum(['default', 'highlight', 'text-only']).optional(),
});

const Part = z.object({
  _id: z.string(),
  name: z.string(),
  title: zStrOpt,
  description: zArray(z.any()),
  image: z.object({
    url: zUrlOpt,
    alt: zStrOpt,
  }).optional().nullable(),
  aspect: z.preprocess(v => v ?? 'video', z.enum(['video', 'square'])),
  imageURL: zStrOpt,
  buttons: zArray(PartButton),
  align: z.enum(['left', 'center', 'right']).optional(),
  layout: z.enum(['plain', 'framed', 'featured', 'card']).optional(),
});

export const Page = z.object({
  _id: z.string(),
  _type: z.literal("page"),
  title: zStrOpt,
  hidden: z.preprocess((val) => val ?? false, z.boolean()),
  path: z.string().min(1),
  redirectTo: zStrOpt,
  mainImage: MainImage.optional().nullable(),
  summary: zArray(z.any()),
  partsBeforeContent: zArray(Part),
  body: zArray(z.any()),
  partsAfterContent: zArray(Part),
  authors: zArray(Author),
  publishedDate: zStrOpt,
  categories: zArray(z.string()),
  originCountry: zStrOpt,
});


export type PageType = Omit<z.infer<typeof Page>, "summary" | "body" | "partsBeforeContent" | "partsAfterContent"> & {
  summary: PortableTextBlock[];
  body: PortableTextBlock[];
  partsBeforeContent: Array<{
    _id: string;
    name: string;
    title?: string;
    description: PortableTextBlock[];
    image?: {
      url?: string;
      alt?: string;
    } | null;
    aspect: 'video' | 'square';
    imageURL?: string;
    buttons: Array<{
      name: string;
      url: string;
      style?: 'default' | 'highlight' | 'text-only';
    }>;
    align?: 'left' | 'center' | 'right';
    layout?: 'plain' | 'framed' | 'featured' | 'card';
  }>;
  partsAfterContent: Array<{
    _id: string;
    name: string;
    title?: string;
    description: PortableTextBlock[];
    image?: {
      url?: string;
      alt?: string;
    } | null;
    aspect: 'video' | 'square';
    imageURL?: string;
    buttons: Array<{
      name: string;
      url: string;
      style?: 'default' | 'highlight' | 'text-only';
    }>;
    align?: 'left' | 'center' | 'right';
    layout?: 'plain' | 'framed' | 'featured' | 'card';
  }>;
};


export const PageList = z.array(Page);
export type PageListType = PageType[];