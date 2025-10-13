import { z } from "zod";
import { defineQuery } from "next-sanity";

/* ------------ helpers ------------ */
const STR = z.string();
const STR_OPT = z.string().nullish().transform(v => (v == null ? undefined : v));
const URL_OPT = z.string().url().nullish().transform(v => (v == null ? undefined : v));
const NUM_OPT = z.number().int().nullish().transform(v => (v == null ? undefined : v));
const BOOL_DFALSE = z.boolean().nullish().transform(v => Boolean(v));              // null/undefined -> false
const ARR = <T extends z.ZodTypeAny>(s: T) => z.array(s).nullish().default([]);
// Accept both string and number for column (backward compatibility), convert to number
const COL_OPT = z.union([z.string(), z.number()]).nullish().transform(v => {
  if (v == null) return undefined;
  return typeof v === 'string' ? parseInt(v, 10) : v;
});

// Allow missing/empty hrefs but give a safe fallback for rendering
const HREF_DEFAULT = z
  .string()
  .nullish()
  .transform(v => (v == null || v === "" ? "#" : v));

/* ------------ schemas ------------ */

export const NAV_SUB_ITEM = z.object({
  label: STR,
  href: HREF_DEFAULT,                     // sub links can be missing -> "#"
  description: STR_OPT,                   // null/undefined ok
});
export type NavSubItem = z.infer<typeof NAV_SUB_ITEM>;

export const NAV_LINK = z.object({
  label: STR,
  href: HREF_DEFAULT,                     // null -> "#"
  column: COL_OPT,                        // accepts string or number, null/undefined ok
  separator: BOOL_DFALSE,                 // null -> false
  description: STR_OPT,                   // null/undefined ok
  subItems: ARR(NAV_SUB_ITEM),            // null -> []
});
export type MenuLinkType = z.infer<typeof NAV_LINK>;

export const NAV_INFO = z.object({
  title: STR_OPT,
  description: STR_OPT,
  backgroundImage: URL_OPT,
  buttonLabel: STR_OPT,
  buttonLink: HREF_DEFAULT.optional(),    // if present but null -> "#"
  useLink: BOOL_DFALSE,                   // null -> false
});
export type NavInfo = z.infer<typeof NAV_INFO>;

export const NAV_MENU_ITEM = z.object({
  label: STR,
  useColumns: BOOL_DFALSE,
  useInfoCard: BOOL_DFALSE,
  href: HREF_DEFAULT,                     // top-level href may be null -> "#"
  useDirectLink: BOOL_DFALSE,
  info: z.object(NAV_INFO.shape).nullish().transform(v => (v == null ? undefined : v)),
  links: ARR(NAV_LINK),                   // null -> []
});
export type MenuItemType = z.infer<typeof NAV_MENU_ITEM>;

export const NAV_MENU = z.object({
  menuItems: ARR(NAV_MENU_ITEM),          // null -> []
});
export type NavMenu = z.infer<typeof NAV_MENU>;

/* ------------ GROQ ------------ */

export const NAV_QUERY = defineQuery(`
*[_type=="siteMenu"][0]{
  menuItems[]{
    label,
    useColumns,
    useInfoCard,
    "href": href,
    useDirectLink,
    info{
      title,
      description,
      "backgroundImage": backgroundImage.asset->url,
      buttonLabel,
      buttonLink,
      useLink
    },
    links[]{
      label,
      "href": href,
      column,
      separator,
      description,
      subItems[]{
        label,
        "href": href,
        description
      }
    }
  }
}
`);

export const NAV_TAG = "site-navigation";
