import { defineType, defineField } from "sanity";

export const roleType = defineType({
    name: "role",
    title: "Role",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Role / Contribution",
            type: "string",
            description:
                "Defines this person's contribution — for example: Author, Editor, Speaker, Organizer, Photographer, or Researcher.",
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
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "description",
        },
    },
});
