import { defineType, defineField } from "sanity";

export const professionalTitle = defineType({
    name: "professionalTitle",
    title: "Professional Title",
    type: "document",
    description: "Defines job title or specialization from CV or external employment",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            validation: (Rule) => Rule.required(),
            description: "e.g., CEO, CTO, Engineer, Researcher, Photographer",
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
            description: "What this title typically involves",
        }),
        defineField({
            name: "isActive",
            title: "Is Active",
            type: "boolean",
            initialValue: true,
            description: "Inactive titles won't be shown in selection",
        }),
    ],
    preview: {
        select: {
            title: "title",
            active: "isActive",
        },
        prepare({ title, active }) {
            return {
                title,
                subtitle: !active ? "(Inactive)" : "",
            };
        },
    },
});
