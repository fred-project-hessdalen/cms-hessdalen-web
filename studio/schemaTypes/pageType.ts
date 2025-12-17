import { defineType, defineField } from "sanity";
import { countryList } from "./lists/countryList";

export const pageType = defineType({
    name: "page",
    title: "Page",
    type: "document",

    // Optional: make "Sort by path" available in Studio lists
    orderings: [
        {
            title: "Path ↑, Title ↑",
            name: "pathAscTitleAsc",
            by: [
                { field: "path", direction: "asc" },
                { field: "title", direction: "asc" },
            ],
        },
        {
            title: "publishedDate ↑, Name ↑",
            name: "publishedDateAscNameAsc",
            by: [
                { field: "publishedDate", direction: "asc" },
                { field: "title", direction: "asc" },
            ],
        },
    ],

    groups: [
        {
            name: 'edit',
            title: 'Edit',
            default: true
        },
        {
            name: 'props',
            title: 'Properties'
        }
    ],

    fieldsets: [
        {
            name: 'navigation',
            title: 'Advanced Navigation Settings',
            options: { collapsible: true, collapsed: true }
        },
        {
            name: 'image',
            title: 'Main Image',
            options: { collapsible: true, collapsed: true }
        }
    ],

    fields: [
        defineField({
            name: "title",
            type: "string",
            group: ['edit', 'props'],
        }),
        defineField({
            name: "path",
            title: "Path (no leading slash)",
            type: "string",
            group: ['edit', 'props'],
            description: `Examples: "card", "card/fred", "docs/getting-started"`,
            validation: (Rule) =>
                Rule.required()
                    .regex(/^(?!news(?:\/|$))(?!people(?:\/|$))(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)$/i, {
                        name: "path",
                    })
                    .custom(async (value, ctx) => {
                        if (!value) return true; // handled by required()

                        // ✅ use getClient to see both published and drafts
                        const client = ctx.getClient({ apiVersion: "2024-05-01" });

                        // Current doc id without drafts. prefix
                        const baseId = (ctx.document?._id || "").replace(/^drafts\./, "");

                        try {
                            // Count any *other* page with the same path
                            const isUnique: boolean = await client.fetch(
                                `count(*[
              _type == "page" &&
              path == $path &&
              !(_id in [$id, "drafts." + $id])
            ]) == 0`,
                                { path: value, id: baseId }
                            );

                            return isUnique ? true : "Path must be unique";
                        } catch (err) {
                            console.error("Path uniqueness check failed:", err);
                            // Don’t block authoring on transient API errors—treat as valid or show a soft message
                            return "Could not verify uniqueness right now. Try again.";
                        }
                    }),
        }),
        defineField({
            name: "hidden",
            title: "Hidden",
            type: "boolean",
            description: "Hide this page from navigation and sitemaps",
            initialValue: false,
            fieldset: 'navigation',
            group: 'props',
        }),
        defineField({
            name: "redirectTo",
            title: "Redirect To (optional)",
            type: "string",
            description: 'Internal path (e.g., "other-page") or external URL (e.g., "https://example.com").',
            fieldset: 'navigation',
            group: 'props',
        }),

        defineField({
            name: "menu",
            title: "Menu",
            type: "array",
            of: [
                {
                    type: "object",
                    name: "menuItem",
                    title: "Menu Item",
                    fields: [
                        { name: "name", type: "string", title: "Name" },
                        { name: "link", type: "string", title: "Link" }, // or type: "url" if you want to restrict to URLs
                    ],
                    preview: {
                        select: { title: "name", subtitle: "link" }
                    }
                }
            ],
            description: "Optional menu for this page. Each item has a name and a link.",
            fieldset: 'navigation',
            group: 'props',
        }),


        // Tile / Cover image
        defineField({
            name: "mainImage",
            title: "Image",
            type: "image",
            options: { hotspot: true },
            fieldset: 'image',
            group: 'props',
            fields: [
                {
                    name: "alt",
                    type: "string",
                    title: "Alt text",
                    description: "Important for accessibility and SEO",
                },
                {
                    name: "layout",
                    title: "Display",
                    type: "string",
                    options: {
                        list: [
                            { title: "Standard (16:9)", value: "standard" },
                            { title: "Banner (16:3) - Top", value: "banner-top" },
                            { title: "Banner (16:3) - Middle", value: "banner" },
                            { title: "Banner (16:3) - Bottom", value: "banner-bottom" },
                            { title: "Original (As Is)", value: "original" },
                        ],
                        layout: "radio",
                        direction: "vertical",
                    },
                    initialValue: "standard",
                },
            ],
        }),

        // Short summary field
        defineField({
            name: 'summary',
            title: 'Short summary',
            type: 'array',
            group: 'props',
            of: [
                {
                    type: 'block',
                    styles: [{ title: 'Normal', value: 'normal' }],
                    lists: [
                        { title: 'Bullet', value: 'bullet' },
                        { title: 'Numbered', value: 'number' },
                    ],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                        ],
                    },
                },
            ],
            validation: (Rule) =>
                Rule.max(3).warning('Keep the summary short (max 3 blocks/paragraphs)'),
        })
        ,
        defineField({
            name: "body",
            title: "Article Content",
            type: "array",
            group: ['edit'],
            of: [
                { type: "block" }, // rich text
                { type: 'imageBlock' },
                { type: 'imageGallery' },
                { type: 'imageList' },
                { type: 'partsList' },
                { type: 'textColumns' },
                { type: 'callout' },
                { type: 'collapsible' },
                { type: 'youtubeVideo' },
                { type: 'googleSlidesEmbed' },
                { type: 'googleDocumentEmbed' },
                { type: 'kofiEmbed' },
            ],
        }),
        defineField({
            name: "restricted",
            title: "Members-Only Content",
            type: "array",
            group: ['edit'],
            of: [
                { type: "block" }, // rich text
                { type: 'imageBlock' },
                { type: 'imageGallery' },
                { type: 'imageList' },
                { type: 'partsList' },
                { type: 'textColumns' },
                { type: 'callout' },
                { type: 'collapsible' },
                { type: 'youtubeVideo' },
                { type: 'googleSlidesEmbed' },
                { type: 'googleDocumentEmbed' },
                { type: 'kofiEmbed' },
            ],
        }),


        defineField({
            name: "publishedDate",
            title: "Published Date",
            type: "datetime",
            group: 'props',
        }),
        // Multiple authors
        defineField({
            name: "authors",
            title: "Authors",
            type: "array",
            of: [{ type: "credit" }],   // 👈 object, not reference
            validation: (Rule) => Rule.min(1),
            group: 'props',
        }),


        // Multiple categories
        defineField({
            name: "categories",
            title: "Article Categories",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{ type: "category" }],
                }
            ],
            group: 'props',
        }),

        // Single origin country
        defineField({
            name: "originCountry",
            title: "Country of Origin",
            type: "string",
            options: {
                list: countryList,
            },
            group: 'props',
        }),
    ],
    preview: {
        select: {
            title: "title",
            hereDate: "publishedDate",
            path: "path",
            media: "mainImage",
        },
        prepare({ title, hereDate, path, media }) {
            let subtitle = "";

            if (hereDate) {
                const d = new Date(hereDate);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                const hh = String(d.getHours()).padStart(2, "0");
                const min = String(d.getMinutes()).padStart(2, "0");

                subtitle = `/${path} (${yyyy}.${mm}.${dd} ${hh}:${min})`;

            } else {
                subtitle = `/${path} `;
            }

            return {
                title,
                subtitle,
                media,
            };
        },
    },


});
