import { defineType, defineField } from "sanity";

export const membershipType = defineType({
    name: "membershipType",
    title: "Membership Type",
    type: "document",
    description: "Defines how someone belongs to the organization",
    fields: [
        defineField({
            name: "title",
            title: "Membership Title",
            type: "string",
            validation: (Rule) => Rule.required(),
            description: "e.g., National Representative, Team Member, Volunteer",
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
            description: "What this membership type means",
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
            description: "Inactive types won't be shown in selection",
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
