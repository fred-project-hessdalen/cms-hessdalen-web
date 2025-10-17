import { defineType, defineField } from "sanity";

export const googleDocumentEmbed = defineType({
    name: "googleDocumentEmbed",
    title: "Google Document",
    type: "object",
    fields: [
        defineField({
            name: "title",
            title: "Title (optional)",
            type: "string",
        }),
        defineField({
            name: "embedUrl",
            title: "Google Document URL",
            type: "url",
            description:
                "Paste the Google Docs URL. Should look like: https://docs.google.com/document/d/[ID]/edit",
            validation: (Rule) =>
                Rule.required()
                    .uri({ scheme: ["https"] })
                    .custom((value) => {
                        if (!value) return true;
                        const isValid = /^https:\/\/docs\.google\.com\/document\/d\/[^/]+\/(edit|preview)/i.test(value);
                        return isValid || 'Please use a valid Google Docs URL (should contain /document/d/.../edit or .../preview)';
                    }),
        }),
        defineField({
            name: 'aspect',
            title: 'Aspect Ratio',
            type: 'string',
            options: {
                list: [
                    { title: 'Narrow', value: 'landscape' },
                    { title: 'Square (1:1)', value: 'square' },
                    { title: 'Tall', value: 'portrait' },
                ],
                layout: 'radio',
            },
            initialValue: 'portrait',
            description: 'Choose the aspect ratio for the document display',
        }),
    ],
    preview: {
        select: {
            title: "title",
            aspect: "aspect",
        },
        prepare({ title, aspect }) {
            const ratio =
                aspect === "landscape" ? "Narrow" :
                    aspect === "square" ? "Square" :
                        aspect === "portrait" ? "Tall" :
                            "Tall";

            return {
                title: title || "Google Document",
                subtitle: ratio,
                media: () => "📄",
            };
        },
    },
});
