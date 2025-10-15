import { defineType, defineField } from "sanity";
import { newsCategoryList } from "./lists/newsCategoryList";
import { countryList } from "./lists/countryList";

export const newsType = defineType({
    name: "news",
    title: "News Article",
    type: "document",
    fieldsets: [
        {
            name: "publishDates",
            title: "Publish Dates",
            options: { columns: 2 },
        },
    ],
    fields: [
        defineField({
            name: "title",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            type: "slug",
            options: { source: "title" },
            validation: (Rule) => Rule.required(),
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
            ],
        }),

        // Link to original article
        defineField({
            name: "originalArticleUrl",
            title: "Original Article URL",
            type: "url",
            description: "Link to the original source of this article",
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
                { type: 'imageList' },
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

        // Dates (grouped in fieldset)
        defineField({
            name: "originalPublishedDate",
            title: "Original Published Date",
            type: "datetime",
            fieldset: "publishDates",
        }),
        defineField({
            name: "publishedHereDate",
            title: "Published Here Date",
            type: "datetime",
            fieldset: "publishDates",
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
            hereDate: "publishedHereDate",
            originalUrl: "originalArticleUrl",
            media: "mainImage",
        },
        prepare({ title, hereDate, originalUrl, media }) {
            let subtitle = "";

            if (hereDate) {
                const d = new Date(hereDate);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                const hh = String(d.getHours()).padStart(2, "0");
                const min = String(d.getMinutes()).padStart(2, "0");

                subtitle = `${yyyy}.${mm}.${dd} ${hh}:${min}`;
                if (originalUrl) {
                    subtitle += " 🔁";
                }
            }

            return {
                title,
                subtitle,
                media,
            };
        },
    },


});
