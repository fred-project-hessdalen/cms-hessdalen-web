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
  menu[]{
    name,
    link
  },
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
    },
    _type == "businessCard" => {
      ...,
      cardPage->{
        title,
        path,
        mainImage{
          asset->{url},
          alt
        },
        summary[]{ ... }
      }
    }
  },
  restricted[]{
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
    },
    _type == "businessCard" => {
      ...,
      cardPage->{
        title,
        path,
        mainImage{
          asset->{url},
          alt
        },
        summary[]{ ... }
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
    person->{name, displayName, image}
  },
  publishedDate,
  categories[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    color
  },
  originCountry
`;

export const PAGE_BY_PATH_QUERY = defineQuery(`
  *[_type == "page" && path == $path][0] {
    ${PAGE_FIELDS}
  }
`);

export const PAGE_SEARCH_QUERY = defineQuery(`
  *[_type == "page" && (
    title match $q || 
    summary[].children[].text match $q || 
    body[].children[].text match $q ||
    body[_type == "collapsible"].content[].children[].text match $q
  )] | order(publishedDate desc)[0...10] {
    ${PAGE_FIELDS}
  }
`);

export const PAGE_ALL_QUERY = defineQuery(`
  *[_type == "page"] | order(path asc) {
    ${PAGE_FIELDS}
  }
`);

export const PAGE_BY_TAG_QUERY = `
  *[_type == "page" && references(*[_type == "category" && slug.current == $tag][0]._id)] | order(publishedDate desc)[0...50] {
    ${PAGE_FIELDS}
  }
`;
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
    displayName: zStrOpt,
    image: z.any().optional(),
  }).optional(),
});

export const Page = z.object({
  _id: z.string(),
  _type: z.literal("page"),
  title: zStrOpt,
  hidden: z.preprocess((val) => val ?? false, z.boolean()),
  path: z.string().min(1),
  redirectTo: zStrOpt,
  menu: z.preprocess(
    (val) => (val == null ? [] : val),
    z.array(z.object({
      name: z.string(),
      link: z.string().nullable().optional(),
    }))
  ).optional(),
  mainImage: MainImage.optional().nullable(),
  summary: zArray(z.any()),
  body: zArray(z.any()),
  restricted: zArray(z.any()),
  authors: zArray(Author),
  publishedDate: zStrOpt,
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


export type PageType = Omit<z.infer<typeof Page>, "summary" | "body" | "restricted"> & {
  summary: PortableTextBlock[];
  body: PortableTextBlock[];
  restricted: PortableTextBlock[];
  menu?: { name: string; link?: string | null }[];
};


export const PageList = z.array(Page);
export type PageListType = PageType[];