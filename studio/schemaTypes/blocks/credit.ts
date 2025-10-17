// schemas/objects/credit.ts
import { defineType, defineField } from "sanity";

export const credit = defineType({
    name: "credit",
    title: "Credit",
    type: "object",
    fields: [
        defineField({
            name: "person",
            type: "reference",
            to: [{ type: "person" }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "role",
            title: "Role",
            type: "reference",
            to: [{ type: "role" }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "note",
            type: "string",
            description: "Optional note about this contribution",
        }),
    ],
    preview: {
        select: {
            title: "person.name",
            subtitle: "role.title",
            media: "person.image"
        },
    },
});
