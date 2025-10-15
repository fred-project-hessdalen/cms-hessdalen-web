// src/lib/sanity/people.query.ts
import { z } from "zod";
import { defineQuery } from "next-sanity";
import type { PortableTextBlock } from "sanity"; // or "@portabletext/types"

/** ── GROQ ─────────────────────────────────────────────────────────────── */

const PEOPLE_FIELDS = `
  _id,
  _type,
  name,
  "slug": slug.current,
  title,
  email,
  "mobile": select(canShowMobileNumber == true => mobileNumber, null),
  country,
  website,
  isActive,
  group,
  "image": image.asset->url,
  summary,
  bio[]{
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
        _type == "imageBlock" => {
          ...,
          asset->{url}
        }
      }
    }
  },
  socials[]{
    label,
    url
  }
`;

export const PEOPLE_LIST_QUERY = defineQuery(`
  *[_type == "person"] | order(group asc, name asc) {
    ${PEOPLE_FIELDS}
  }
`);

export const PEOPLE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "person" && slug.current == $slug][0]{
    ${PEOPLE_FIELDS}
  }
`);


export const PEOPLE_SEARCH_QUERY = defineQuery(`
  *[_type == "person" && (name match $q || title match $q || email match $q || summary[].children[].text match $q || bio[].children[].text match $q)] | order(name asc)[0...10] {
    ${PEOPLE_FIELDS}
  }
`);


/** ── Zod ──────────────────────────────────────────────────────────────── */

// helpers
const zStrOpt = z.preprocess(v => (v ?? undefined), z.string().optional());
const zUrlOpt = z.preprocess(v => (v ?? undefined), z.string().url().optional());
const zArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess(v => (v == null ? [] : v), z.array(item));

export const SocialLink = z.object({
  label: zStrOpt,
  url: zUrlOpt,
});

// person doc
export const People = z.object({
  _id: z.string(),
  _type: z.literal("person"),
  name: z.string().min(1),
  slug: z.string().min(1),

  title: zStrOpt,
  email: z.preprocess(v => (v ?? undefined), z.string().email().optional()),

  // NEW: summary + mobile (GROQ can return null → treat as undefined)
  summary: zStrOpt,
  mobile: zStrOpt,

  image: zUrlOpt,
  website: zUrlOpt,
  country: zStrOpt,

  // Use PortableTextBlock structure for bio
  bio: zArray(z.any()),

  socials: zArray(SocialLink),

  isActive: z.boolean().optional(),
});

// ── TypeScript-only override so PortableText accepts people.bio ──────────
// CHANGED: Replace the inferred `bio: unknown[]` with `PortableTextBlock[]`
type PeopleZod = z.infer<typeof People>;
export type PeopleType = Omit<PeopleZod, "bio"> & { bio: PortableTextBlock[] };

// CHANGED: Keep Zod list as-is, but export the list item type as PeopleType
export const PeopleList = z.array(People);
export type PeopleListType = PeopleType[]; // was: z.infer<typeof PeopleList>

