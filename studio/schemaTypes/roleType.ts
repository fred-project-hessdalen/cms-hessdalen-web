import { defineType, defineField } from "sanity";

export const roleType = defineType({
    name: "role",
    title: "Role",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Role Title",
            type: "string",
            validation: (Rule) => Rule.required(),
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
        }),
        defineField({
            name: "category",
            title: "Category",
            type: "string",
            options: {
                list: [
                    { title: "Creative", value: "creative" },
                    { title: "Technical", value: "technical" },
                    { title: "Research & Development", value: "research_development" },
                    { title: "Leadership", value: "leadership" },
                    { title: "Support", value: "support" },
                    { title: "Media", value: "media" },
                    { title: "Other", value: "other" },
                ],
            },
        }),
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "category",
        },
    },
});
