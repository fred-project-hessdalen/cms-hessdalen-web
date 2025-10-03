// src/sanity/siteSettings.query.ts
import { z } from "zod";
import { defineQuery } from "next-sanity";


const BANNER = z.object({
  enabled: z.boolean().optional().default(false),

  // accept string | null | undefined, output string | undefined
  message: z.string().optional(),

  // accept null/undefined, default to "info"
  variant: z.preprocess(
    v => (v ?? undefined),
    z.enum(["info", "warning", "success", "danger"]).optional().default("info")
  ),
});

const SOCIAL_LINK = z.object({
  logo: z.string().url(), // Image asset URL
  label: z.string(),
  url: z.string().url(),
});

const SOCIALS = z.array(SOCIAL_LINK).optional();

export const SITE_SETTINGS = z.object({
  siteName: z.string(),
  tagline: z.string().optional(),
  baseUrl: z.string(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  banner: BANNER.optional(),
  socials: SOCIALS,
});
export type SiteSettings = z.infer<typeof SITE_SETTINGS>;

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type=="siteSettings"][0]{
    siteName, tagline, baseUrl, locale, timezone,
    "logo": logo.asset->url,
    "favicon": favicon.asset->url,
    banner{
      enabled, 
      message, 
      variant
    },
    socials[]{
      "logo": logo.asset->url,
      label,
      url
    }
  }
`);

export const SITE_SETTINGS_TAG = "site-settings";
