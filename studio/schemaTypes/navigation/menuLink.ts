import { defineType, defineField, defineArrayMember } from "sanity";

const hrefValidation = (R: any) =>
    R.required()
        .custom((val: unknown) => {
            if (typeof val !== "string") return "Must be a string";
            // allow internal routes (/foo) OR absolute http/https URLs
            if (/^\/[^\s]*$/.test(val) || /^https?:\/\/[^\s]+$/i.test(val)) return true;
            return "Use a relative path (/path) or a full http(s) URL";
        });

export const menuLink = defineType({
    name: "menuLink",
    title: "Menu Link",
    type: "object",
    fields: [
        defineField({
            name: "label",
            type: "string",
            validation: (R) =>
                R.required()
                    .min(1)
                    .custom((v) => (typeof v === "string" && v.trim() ? true : "Label is required")),
        }),
        defineField({
            name: "href",
            type: "string",
            description: "Relative (/foo) or absolute (https://...)",
            validation: hrefValidation,
        }),
        defineField({
            name: "subItems",
            title: "Sub items",
            type: "array",
            of: [defineArrayMember({ type: "menuLink" })], // recursive
        }),
        defineField({
            name: "column",
            type: "number",
            options: { list: [1, 2, 3] },
            description: "Column placement in mega menu",
        }),
        defineField({
            name: "separator",
            type: "boolean",
            initialValue: false,
            description: "Render a separator before this item",
        }),
        defineField({
            name: "description",
            type: "text",
            rows: 2,
        }),
    ],
    preview: {
        select: { title: "label", subtitle: "href" },
    },
});
