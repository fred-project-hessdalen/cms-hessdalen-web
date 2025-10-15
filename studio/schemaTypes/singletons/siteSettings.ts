import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
    name: "siteSettings",
    title: "Site Settings (Singleton)",
    type: "document",
    fields: [
        defineField({ name: "siteName", title: "Site name", type: "string", validation: R => R.required() }),
        defineField({ name: "tagline", title: "Tagline", type: "string" }),

        defineField({
            name: "logo",
            title: "Logo (light)",
            type: "image",
            options: { hotspot: true },
            validation: R => R.required(),
        }),
        defineField({
            name: "logoDark",
            title: "Logo (dark)",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "favicon",
            title: "Favicon",
            type: "image",
            options: { hotspot: false },
            description: "Square image works best",
        }),
        defineField({
            name: "ogImage",
            title: "Default social share image (OG)",
            type: "image",
            options: { hotspot: true },
            description: "Fallback Open Graph image for pages without their own",
        }),
        defineField({
            name: "notFoundImage",
            title: "404 Not Found Image",
            type: "image",
            options: { hotspot: true },
            description: "Image displayed on 404 error pages",
        }),

        defineField({
            name: "baseUrl",
            title: "Base URL",
            type: "url",
            description: "e.g. https://projecthessdalen.no (no trailing slash)",
            validation: R => R.required().uri({ allowRelative: false, scheme: ["http", "https"] }),
        }),

        // Homepage
        defineField({
            name: 'homepagePages',
            title: 'Homepage Pages',
            type: 'array',
            of: [{
                type: 'reference',
                to: [{ type: 'page' }]
            }],
            description: 'Select pages to display on the homepage (in order)'
        }),

        defineField({
            name: "partsOnTopOfPage",
            title: "Parts on Top of Page",
            type: "array",
            of: [{ type: 'reference', to: [{ type: 'part' }] }],
            description: "Add part blocks to display at the top of the homepage",
        }),

        defineField({
            name: "partsBeforeSiteMap",
            title: "Parts Before SiteMap",
            type: "array",
            of: [{ type: 'reference', to: [{ type: 'part' }] }],
            description: "Add part blocks to display before the sitemap",
        }),

        defineField({
            name: "partsOnBottomOfPage",
            title: "Parts on Bottom of Page",
            type: "array",
            of: [{ type: 'reference', to: [{ type: 'part' }] }],
            description: "Add part blocks to display at the bottom of the homepage",
        }),

        // SEO
        defineField({
            name: "seo",
            title: "Default SEO",
            type: "object",
            fields: [
                defineField({ name: "titleTemplate", type: "string", description: "e.g. %s — Project Hessdalen" }),
                defineField({ name: "description", type: "text", rows: 3 }),
                defineField({
                    name: "twitterCard",
                    type: "string",
                    options: { list: ["summary", "summary_large_image"] },
                    initialValue: "summary_large_image",
                }),
            ],
        }),

        // Socials
        defineField({
            name: "socials",
            title: "Social Links",
            type: "array",
            of: [{ type: "socialLink" }],
        }),

        // Footer / contact
        defineField({
            name: "footer",
            title: "Footer",
            type: "object",
            fields: [
                defineField({ name: "copyright", type: "string", initialValue: "© Project Hessdalen" }),
                defineField({ name: "footerNote", type: "text", rows: 2 }),
            ],
        }),
        defineField({
            name: "contact",
            title: "Contact",
            type: "object",
            fields: [
                defineField({ name: "email", type: "string" }),
                defineField({ name: "phone", type: "string" }),
            ],
        }),

        // Locale & time
        defineField({ name: "locale", title: "Default locale", type: "string", initialValue: "nb-NO" }),
        defineField({ name: "timezone", title: "Default timezone", type: "string", initialValue: "Europe/Oslo" }),

        // Optional notice/banner
        defineField({
            name: "banner",
            title: "Site Banner (optional)",
            type: "object",
            fields: [
                defineField({ name: "enabled", type: "boolean", initialValue: false }),
                defineField({ name: "message", type: "string" }),
                defineField({ name: "variant", type: "string", options: { list: ["info", "warning", "success", "danger"] } }),
            ],
        }),
    ],
    preview: { select: { title: "siteName", subtitle: "tagline", media: "logo" } },
});
