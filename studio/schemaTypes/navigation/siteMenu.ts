import { defineType, defineField, defineArrayMember } from "sanity";

export const siteMenu = defineType({
    name: "siteMenu",
    title: "Site Menu (Singleton)",
    type: "document",
    fields: [
        defineField({
            name: "menuItems",
            type: "array",
            of: [defineArrayMember({ type: "menuItem" })],
            validation: (R) => R.min(1).error("Add at least one top-level menu item."),
        }),
    ],
    preview: {
        prepare() {
            return { title: "Site Menu" };
        },
    },
});
