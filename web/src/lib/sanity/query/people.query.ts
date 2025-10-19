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
  email,
  "mobile": select(canShowMobileNumber == true => mobileNumber, null),
  country,
  website,
  isActive,
  group,
  "image": image.asset->url,
  summary,
  professionalTitle->{
    _id,
    title,
    "slug": slug.current
  },
  membershipType->{
    _id,
    title,
    "slug": slug.current,
    description,
    order
  },
  organizationalRoles[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    order
  },
  affiliations[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    type,
    color
  },
  professionalAffiliations[]{
    title,
    organization,
    organizationUrl,
    startDate,
    endDate,
    isPrimary,
    description
  },
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
  *[_type == "person" && (name match $q || email match $q || summary[].children[].text match $q || bio[].children[].text match $q)] | order(name asc)[0...10] {
    ${PEOPLE_FIELDS}
  }
`);

export const ALL_ORGANIZATIONAL_ROLES_QUERY = defineQuery(`
  *[_type == "organizationalRole" && isActive == true] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    order
  }
`);

export const ALL_AFFILIATIONS_QUERY = defineQuery(`
  *[_type == "affiliationType" && isActive == true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    type,
    color
  }
`);

export const PEOPLE_BY_ROLE_QUERY = defineQuery(`
  *[_type == "person" && $roleSlug in organizationalRoles[]->slug.current] | order(group asc, name asc) {
    ${PEOPLE_FIELDS}
  }
`);

export const PEOPLE_BY_AFFILIATION_QUERY = defineQuery(`
  *[_type == "person" && $groupSlug in affiliations[]->slug.current] | order(group asc, name asc) {
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

const ReferenceWithTitle = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.preprocess(
    v => {
      // Handle both "string" and { current: "string" } formats
      if (typeof v === 'string') return v;
      if (v && typeof v === 'object' && 'current' in v) return v.current;
      return undefined;
    },
    z.string()
  ),
});

const MembershipType = z.preprocess(
  v => v ?? undefined,
  ReferenceWithTitle.extend({
    description: zStrOpt,
    order: z.number().optional(),
  }).optional()
);

const OrganizationalRole = ReferenceWithTitle.extend({
  description: zStrOpt,
  order: z.number().optional(),
});

const Affiliation = ReferenceWithTitle.extend({
  description: zStrOpt,
  type: zStrOpt,
  color: zStrOpt,
});

const ProfessionalAffiliation = z.object({
  title: zStrOpt,
  organization: zStrOpt,
  organizationUrl: zUrlOpt,
  startDate: zStrOpt,
  endDate: zStrOpt,
  isPrimary: z.boolean().optional(),
  description: zStrOpt,
});

// person doc
export const People = z.object({
  _id: z.string(),
  _type: z.literal("person"),
  name: z.string().min(1),
  slug: z.string().min(1),

  email: z.preprocess(v => (v ?? undefined), z.string().email().optional()),

  // NEW: summary + mobile (GROQ can return null → treat as undefined)
  summary: zStrOpt,
  mobile: zStrOpt,

  image: zUrlOpt,
  website: zUrlOpt,
  country: zStrOpt,
  group: z.preprocess(v => v ?? undefined, z.number().int().min(1).max(10).optional()),

  // Organization fields
  professionalTitle: z.preprocess(v => v ?? undefined, ReferenceWithTitle.optional()),
  membershipType: MembershipType,
  organizationalRoles: zArray(OrganizationalRole),
  affiliations: zArray(Affiliation),
  professionalAffiliations: zArray(ProfessionalAffiliation),

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

// Organizational Roles and Affiliations lists
export const OrganizationalRolesList = z.array(OrganizationalRole);
export type OrganizationalRolesListType = z.infer<typeof OrganizationalRolesList>;

export const AffiliationsList = z.array(Affiliation);
export type AffiliationsListType = z.infer<typeof AffiliationsList>;
