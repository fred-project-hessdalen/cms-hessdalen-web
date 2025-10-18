import { defineType, defineField } from "sanity";

export const affiliationType = defineType({
    name: "affiliationType",
    title: "Affiliation / Group",
    type: "document",
    description: "Defines which part or unit they belong to",
    fields: [
        defineField({
            name: "title",
            title: "Affiliation Title",
            type: "string",
            validation: (Rule) => Rule.required(),
            description: "e.g., Board, Tech Team, Advisory Council",
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "title",
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 3,
            description: "What this group/unit does",
        }),
        defineField({
            name: "type",
            title: "Type",
            type: "string",
            options: {
                list: [
                    { title: "Team", value: "team" },
                    { title: "Committee", value: "committee" },
                    { title: "Board", value: "board" },
                    { title: "Council", value: "council" },
                    { title: "Chapter", value: "chapter" },
                    { title: "Partner Organization", value: "partner" },
                    { title: "Other", value: "other" },
                ],
            },
            description: "Type of group/unit",
        }),
        defineField({
            name: "color",
            title: "Color",
            type: "string",
            options: {
                list: [
                    { title: "Blue", value: "blue" },
                    { title: "Green", value: "green" },
                    { title: "Red", value: "red" },
                    { title: "Yellow", value: "yellow" },
                    { title: "Purple", value: "purple" },
                    { title: "Pink", value: "pink" },
                    { title: "Gray", value: "gray" },
                ],
            },
            description: "Color for visual grouping on the website",
        }),
        defineField({
            name: "order",
            title: "Sort Order",
            type: "number",
            description: "Lower numbers appear first (e.g., 1 = highest priority)",
            initialValue: 100,
            validation: (Rule) => Rule.integer().min(0),
        }),
        defineField({
            name: "isActive",
            title: "Is Active",
            type: "boolean",
            initialValue: true,
            description: "Inactive affiliations won't be shown in selection",
        }),
    ],
    preview: {
        select: {
            title: "title",
            type: "type",
            order: "order",
            active: "isActive",
        },
        prepare({ title, type, order, active }) {
            return {
                title,
                subtitle: `${type ? type + " • " : ""}Order: ${order}${!active ? " (Inactive)" : ""}`,
            };
        },
    },
});
