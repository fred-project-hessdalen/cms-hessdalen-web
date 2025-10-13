import { defineType, defineField } from "sanity";
import { newsCategoryList } from "./lists/newsCategoryList";
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

    fields: [
        defineField({
            name: "title",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "path",
            title: "Path (no leading slash)",
            type: "string",
            description: `Examples: "card", "card/fred", "docs/getting-started"`,
            validation: (Rule) =>
                Rule.required()
                    .regex(/^(?!news(?:\/|$))(?!people(?:\/|$))(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)$/i, {
                        name: "path",
                    })
                    .custom(async (value, ctx) => {
                        if (!value) return true; // handled by required()

                        // ✅ use getClient + previewDrafts to see both published and drafts
                        const client = ctx.getClient({ apiVersion: "2024-05-01", perspective: "previewDrafts" });

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
        // Tile / Cover image
        defineField({
            name: "mainImage",
            title: "Tile Image",
            type: "image",
            options: { hotspot: true },
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
                            { title: "Standard (1600×900)", value: "standard" },
                            { title: "Banner (1600×300)", value: "banner" },
                        ],
                        layout: "radio",
                        isHighlighted: true,
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
            of: [
                { type: "block" }, // rich text
                { type: 'imageBlock' },
                { type: 'imageGallery' },
                { type: 'textColumns' },
                { type: 'callout' },
                { type: 'collapsible' },
                { type: 'youtubeVideo' },
            ],
        }),


        // Multiple authors
        defineField({
            name: "authors",
            title: "Authors",
            type: "array",
            of: [{ type: "credit" }],   // 👈 object, not reference
            validation: (Rule) => Rule.min(1),
        }),

        defineField({
            name: "publishedDate",
            title: "Published Date",
            type: "datetime",
        }),


        // Multiple categories
        defineField({
            name: "categories",
            title: "Article Categories",
            type: "array",
            of: [{ type: "string" }],
            options: {
                list: newsCategoryList,
            },
        }),

        // Single origin country
        defineField({
            name: "originCountry",
            title: "Country of Origin",
            type: "string",
            options: {
                list: countryList,
            },
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
