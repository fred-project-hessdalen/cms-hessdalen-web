// schemas/personType.ts
import { defineType, defineField } from "sanity";
import { countryList } from "./lists/countryList";

export const personType = defineType({
    name: "person",
    title: "Person",
    type: "document",

    // Optional: make "Sort by Group" available in Studio lists
    orderings: [
        {
            title: "Group ↑, Name ↑",
            name: "groupAscNameAsc",
            by: [
                { field: "group", direction: "asc" },
                { field: "name", direction: "asc" },
            ],
        },
    ],

    fields: [
        defineField({
            name: "name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            type: "slug",
            options: { source: "name" },
            validation: (Rule) => Rule.required(),
        }),

        // NEW: group for sorting
        defineField({
            name: "group",
            title: "Group (for sorting)",
            type: "number",
            description: "Chairman = 1, Researchers = 2, Organizers = 3, Volunteers = 5, etc.",
            initialValue: 5,
            validation: (Rule) => Rule.min(0).integer(),
        }),

        defineField({
            name: "title",
            type: "string",
            description: "Job title / role (e.g., Researcher, Organizer)",
        }),

        // NEW: short summary above bio
        defineField({
            name: "summary",
            title: "Summary (short)",
            type: "text",
            rows: 3,
            description: "A few lines shown above the bio.",
            validation: (Rule) =>
                Rule.max(280).warning("Keep it short (≤ 280 characters)."),
        }),

        // NEW: mobile number + visibility toggle
        defineField({
            name: "mobileNumber",
            title: "Mobile number",
            type: "string",
            description: "Optional. Example: +47 400 00 000",
            // light validation: allow digits, spaces, +, -, parentheses
            validation: (Rule) =>
                Rule.regex(/^[0-9+()\-.\s]*$/).warning(
                    "Only digits, spaces and (+ - . ( ))"
                ),
        }),
        defineField({
            name: "canShowMobileNumber",
            title: "Show mobile number on site",
            type: "boolean",
            initialValue: false,
        }),

        defineField({
            name: "email",
            type: "string",
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: "image",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "bio",
            type: "array",
            of: [
                { type: "block" }, // rich text
                {
                    type: "image",   // image block
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'layout',
                            title: 'Display',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Standard (1600×900)', value: 'standard' },
                                    { title: 'Banner (1600×300)', value: 'banner' },
                                ],
                                layout: 'radio',
                                isHighlighted: true, // quick access in the image editor
                            },
                            initialValue: 'standard',
                        },
                        { name: 'caption', type: 'string', title: 'Caption', options: { isHighlighted: true } },
                        { name: 'alt', type: 'string', title: 'Alt text', description: 'Alternative text for screen readers' },
                    ],
                },
                { type: 'imageGallery' },
                { type: 'textColumns' },
                { type: 'callout' },
            ],
        }),
        defineField({
            name: "website",
            type: "url",
        }),
        defineField({
            name: "country",
            title: "Country",
            type: "string",
            options: { list: countryList },
        }),
        defineField({
            name: "socials",
            title: "Social Links",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({ name: "label", type: "string" }), // e.g., X/Twitter, LinkedIn
                        defineField({ name: "url", type: "url" }),
                    ],
                    preview: { select: { title: "label", subtitle: "url" } },
                },
            ],
        }),
        defineField({
            name: "isActive",
            type: "boolean",
            initialValue: true,
        }),
    ],

    preview: {
        select: {
            title: "name",
            group: "group",
            country: "country",
            role: "title",
            media: "image",
        },
        prepare({ title, group, country, role, media }) {
            let subtitle = "";
            if (country && role) subtitle = `${group}. ${role} (${country})`;
            else if (country) subtitle = `${group}. (${country})`;
            else if (role) subtitle = `${group}. (${role})`;

            return { title, subtitle, media };
        },
    },
});
