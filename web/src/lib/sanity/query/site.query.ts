// src/sanity/siteSettings.query.ts
import { z } from "zod";
import { defineQuery } from "next-sanity";


const BANNER = z.object({
  enabled: z.boolean().optional().default(false),
  message: z.preprocess(v => (v == null ? "" : v), z.string()),
  variant: z.preprocess(
    v => (v ?? undefined),
    z.enum(["info", "warning", "success", "danger"]).optional().default("info")
  ),
});

const FOOTER = z.object({
  copyright: z.string().optional(),
  footerNote: z.preprocess(v => v == null ? undefined : v, z.string().optional()),
});

const CONTACT = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
});

const SOCIAL_LINK = z.object({
  logo: z.string().url(), // Image asset URL
  label: z.string(),
  url: z.string().url(),
});

const SOCIALS = z.preprocess(
  v => (v == null ? [] : v),
  z.array(SOCIAL_LINK)
);

export const SITE_SETTINGS = z.object({
  siteName: z.string(),
  tagline: z.string().optional(),
  logo: z.string().url().optional(),
  logoDark: z.preprocess(v => v == null ? undefined : v, z.string().url().optional()),
  favicon: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  notFoundImage: z.preprocess(v => v == null ? undefined : v, z.string().url().optional()),
  baseUrl: z.string(),
  homepagePages: z.preprocess(v => (v == null ? [] : v), z.array(z.any())),
  partsOnTopOfPage: z.preprocess(v => (v == null ? [] : v), z.array(z.any())),
  partsBeforeSiteMap: z.preprocess(v => (v == null ? [] : v), z.array(z.any())),
  partsOnBottomOfPage: z.preprocess(v => (v == null ? [] : v), z.array(z.any())),
  seo: z.object({
    titleTemplate: z.string().optional(),
    description: z.string().optional(),
    twitterCard: z.string().optional(),
  }).optional(),
  socials: SOCIALS,
  footer: FOOTER.optional(),
  contact: CONTACT.optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  banner: BANNER.optional(),
});
export type SiteSettings = z.infer<typeof SITE_SETTINGS>;

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type=="siteSettings"][0]{
    siteName,
    tagline,
    "logo": logo.asset->url,
    "logoDark": logoDark.asset->url,
    "favicon": favicon.asset->url,
    "ogImage": ogImage.asset->url,
    "notFoundImage": notFoundImage.asset->url,
    baseUrl,
    homepagePages[]->{
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
      publishedDate,
      categories[]->{
        _id,
        title,
        "slug": slug.current,
        description,
        color
      },
      originCountry
    },
    partsOnTopOfPage[]->{
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
    partsBeforeSiteMap[]->{
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
    partsOnBottomOfPage[]->{
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
    seo{
      titleTemplate,
      description,
      twitterCard
    },
    socials[]{
      "logo": logo.asset->url,
      label,
      url
    },
    footer{
      copyright,
      footerNote
    },
    contact{
      email,
      phone
    },
    locale,
    timezone,
    banner{
      enabled,
      message,
      variant
    }
  }
`);

export const SITE_SETTINGS_TAG = "site-settings";
