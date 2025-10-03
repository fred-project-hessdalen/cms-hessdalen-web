import { defineType, defineField, defineArrayMember } from "sanity";

export const menuItem = defineType({
    name: "menuItem",
    title: "Menu Item (Top Level)",
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
            name: "useDirectLink",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "href",
            type: "string",
            description: "If provided and useDirectLink is true, clicking the top label navigates directly.",
            hidden: ({ parent }) => !parent?.useDirectLink,
            validation: (R) =>
                R.custom((val, ctx) => {
                    const v = val as string | undefined;
                    if (!v) return true;
                    if (/^\/[^\s]*$/.test(v) || /^https?:\/\/[^\s]+$/i.test(v)) return true;
                    return "Use a relative path (/path) or a full http(s) URL";
                }),
        }),

        defineField({
            name: "useColumns",
            type: "boolean",
            initialValue: false,
            hidden: ({ parent }) => !!parent?.useDirectLink,

        }),
        defineField({
            name: "links",
            type: "array",
            of: [defineArrayMember({ type: "menuLink" })],
            hidden: ({ parent }) => !!parent?.useDirectLink,
        }),
        defineField({
            name: "useInfoCard",
            type: "boolean",
            initialValue: false,
            hidden: ({ parent }) => !!parent?.useDirectLink,

        }),
        defineField({
            name: "info",
            title: "Info Card",
            type: "object",
            fields: [
                defineField({ name: "title", type: "string" }),
                defineField({ name: "description", type: "text", rows: 3 }),
                defineField({
                    name: "backgroundImage",
                    type: "image",
                    options: { hotspot: true },
                }),
                defineField({ name: "useLink", type: "boolean", initialValue: false }),
                defineField({ name: "buttonLabel", type: "string", hidden: ({ parent }) => !parent?.useLink, }),
                defineField({
                    name: "buttonLink",
                    type: "string",
                    description: "Relative or absolute link",
                    hidden: ({ parent }) => !parent?.useLink,
                    validation: (R) =>
                        R.custom((val) => {
                            if (!val) return true;
                            if (typeof val !== "string") return "Must be a string";
                            if (/^\/[^\s]*$/.test(val) || /^https?:\/\/[^\s]+$/i.test(val)) return true;
                            return "Use /path or http(s)://";
                        }),
                }),
            ],
            hidden: ({ parent }) => !parent?.useInfoCard, // optional UX nicety
        }),
    ],
    validation: (R) =>
        R.custom((val) => {
            const v = val as any;
            // Require either links OR href when useDirectLink is true.
            if (v?.useDirectLink) {
                if (!v?.href) return "When 'Use direct link' is on, 'href' is required.";
            }
            // If not direct link and no links, it's empty
            if (!v?.useDirectLink && (!v?.links || v.links.length === 0)) {
                return "Provide at least one link or enable direct link with href.";
            }
            return true;
        }),
    preview: {
        select: {
            title: "label",
            useInfoCard: "useInfoCard",
            href: "href",
            direct: "useDirectLink",
            links: "links", // ← select the array itself
        },
        prepare({ title, useInfoCard, href, direct, links }) {
            const count = Array.isArray(links) ? links.length : 0;
            const sub =
                direct && href
                    ? `Direct → ${href}`
                    : `${count} link${count > 1 ? "s" : ""} ${useInfoCard ? " + Info Card" : ""}`;

            return { title, subtitle: sub };
        },
    },
});
