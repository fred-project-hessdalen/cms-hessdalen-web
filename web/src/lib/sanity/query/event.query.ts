// Query for events
import { z } from "zod";
import { defineQuery } from "next-sanity";
import type { PortableTextBlock } from "sanity";

/** ── GROQ ─────────────────────────────────────────────────────────────── */

const EVENT_FIELDS = `
  _id,
  _type,
  name,
  "slug": slug.current,
  image{
    asset->{url},
    alt
  },
  summary[]{ ... },
  details[]{
    ...,
    _type == "image" => {
      ...,
      asset->{url},
      layout,
      caption,
      alt
    },
    _type == "imageGallery" => {
      ...,
      images[]{
        ...,
        asset->{url},
        description[]{ ... },
        caption,
        credit,
        link
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
    _type == "callout" => {
      ...,
      content[]{ ... }
    }
  },
  start,
  end,
  venue->{
    _id,
    name,
    address,
    city,
    country
  },
  presenters[]{
    role->{
      _id,
      title,
      "slug": slug.current,
      category
    },
    note,
    person->{name, displayName, image}
  },
  tickets
`;

export const EVENT_LIST_QUERY = defineQuery(`
  *[_type == "event"] | order(start desc) {
    ${EVENT_FIELDS}
  }
`);

export const EVENT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "event" && slug.current == $slug][0]{
    ${EVENT_FIELDS}
  }
`);

export const UPCOMING_EVENTS_QUERY = defineQuery(`
  *[_type == "event" && start > now()] | order(start asc)[0...10] {
    ${EVENT_FIELDS}
  }
`);

/** ── Zod ──────────────────────────────────────────────────────────────── */

const zStrOpt = z.preprocess(v => (v ?? undefined), z.string().optional());
const zUrlOpt = z.preprocess(v => (v ?? undefined), z.string().url().optional());
const zArray = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess(v => (v == null ? [] : v), z.array(item));

// Image type
const EventImage = z.object({
  asset: z.object({ url: zUrlOpt }),
  alt: zStrOpt,
});

// Venue type
const Venue = z.preprocess(
  (val) => val ?? undefined,
  z.object({
    _id: z.string(),
    name: z.string(),
    address: zStrOpt,
    city: zStrOpt,
    country: zStrOpt,
  }).optional()
);

// Presenter (credit object)
const Presenter = z.object({
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

export const Event = z.object({
  _id: z.string(),
  _type: z.literal("event"),
  name: z.string().min(1),
  slug: z.string().min(1),
  image: EventImage.optional().nullable(),
  summary: zArray(z.any()),
  details: zArray(z.any()),
  start: zStrOpt,
  end: zStrOpt,
  venue: Venue,
  presenters: zArray(Presenter),
  tickets: zUrlOpt,
});

// TypeScript-only override for PortableText
export type EventType = Omit<z.infer<typeof Event>, "summary" | "details"> & {
  summary: PortableTextBlock[];
  details: PortableTextBlock[];
};

export const EventList = z.array(Event);
export type EventListType = EventType[];
