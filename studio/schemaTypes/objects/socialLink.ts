import { defineType, defineField } from "sanity";

export const socialLink = defineType({
    name: "socialLink",
    title: "Social Link",
    type: "object",
    fields: [
        defineField({
            name: "logo",
            title: "Logo (light)",
            type: "image",
            options: { hotspot: true },
            validation: R => R.required(),
        }),
        defineField({ name: "label", type: "string", validation: R => R.required().min(1).error("Label is required") }),
        defineField({ name: "url", type: "url", validation: R => R.uri({ scheme: ["http", "https"] }) }),
    ],
    preview: { select: { title: "label", subtitle: "url", media: "logo" } },
});
