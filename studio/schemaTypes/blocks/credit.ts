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
            type: "string",
            options: {
                list: [
                    { title: "Author", value: "author" },
                    { title: "Editor", value: "editor" },
                    { title: "Photographer", value: "photographer" },
                    { title: "Presenter", value: "presenter" },
                    { title: "Speaker", value: "speaker" },
                    { title: "Organizer", value: "organizer" },
                    { title: "Translator", value: "translator" },
                    { title: "Reviewer", value: "reviewer" },
                ],
            },
        }),
        defineField({
            name: "note",
            type: "string",
            description: "Optional note about this contribution",
        }),
    ],
    preview: {
        select: { title: "person.name", subtitle: "role", media: "person.image" },
    },
});
