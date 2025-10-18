import { defineType, defineField } from "sanity";

export const organizationalRole = defineType({
    name: "organizationalRole",
    title: "Organizational Role",
    type: "document",
    description: "Defines what function they hold within the structure",
    fields: [
        defineField({
            name: "title",
            title: "Role Title",
            type: "string",
            validation: (Rule) => Rule.required(),
            description: "e.g., Chairman, Board Member, Project Leader",
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
            description: "What this role entails",
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
            description: "Inactive roles won't be shown in selection",
        }),
    ],
    preview: {
        select: {
            title: "title",
            order: "order",
            active: "isActive",
        },
        prepare({ title, order, active }) {
            return {
                title,
                subtitle: `Order: ${order}${!active ? " (Inactive)" : ""}`,
            };
        },
    },
});
