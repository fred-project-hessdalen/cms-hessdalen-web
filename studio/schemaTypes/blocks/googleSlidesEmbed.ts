import { defineType, defineField } from "sanity";

export const googleSlidesEmbed = defineType({
    name: "googleSlidesEmbed",
    title: "Google Slides",
    type: "object",
    fields: [
        defineField({
            name: "title",
            title: "Title (optional)",
            type: "string",
        }),
        defineField({
            name: "embedUrl",
            title: "Google Slides Publish URL",
            type: "url",
            description:
                "In Google Slides: File → Share → Publish to web → Copy the link. Should look like: https://docs.google.com/presentation/d/e/[ID]/pub?start=false&loop=false&delayms=3000",
            validation: (Rule) =>
                Rule.required()
                    .uri({ scheme: ["https"] })
                    .custom((value) => {
                        if (!value) return true;
                        const isValid = /^https:\/\/docs\.google\.com\/presentation\/d\/e\/[^/]+\/pub\?/i.test(value);
                        return isValid || 'Please use the "Publish to web" URL from Google Slides (should contain /presentation/d/e/.../pub?)';
                    }),
        }),
        defineField({
            name: "autoplay",
            title: "Autoplay",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "loop",
            title: "Loop",
            type: "boolean",
            initialValue: false,
        }),
        defineField({
            name: "delaySec",
            title: "Slide delay (seconds)",
            type: "number",
            initialValue: 3,
            description: "Time between slides (1–60 seconds)",
            validation: (Rule) => Rule.min(1).max(60),
        }),
        defineField({
            name: 'aspect',
            title: 'Aspect Ratio',
            type: 'string',
            options: {
                list: [
                    { title: 'Video (16:9)', value: 'video' },
                    { title: 'A4 Landscape (29.7:21cm)', value: 'landscape' },
                    { title: 'Square (1:1)', value: 'square' },
                ],
                layout: 'radio',
            },
            initialValue: 'video',
            description: 'Choose the aspect ratio for the presentation',
        }),
    ],
    preview: {
        select: {
            title: "title",
            autoplay: "autoplay",
            loop: "loop",
            delaySec: "delaySec",
            aspect: "aspect",
        },
        prepare({ title, autoplay, loop, delaySec, aspect }) {
            const delay = typeof delaySec === "number" ? `${delaySec}s` : "4s";
            const ratio =
                aspect === "video" ? "16:9" :
                    aspect === "landscape" ? "A4" :
                        aspect === "square" ? "1:1" :
                            "";

            const bits = [
                autoplay ? "Autoplay" : "Manual",
                loop ? "Loop" : "No loop",
                `Delay ${delay}`,
                ratio && ratio,
            ].filter(Boolean);

            return {
                title: title || "Google Slides",
                subtitle: bits.join(" • "),
                media: () => "🖥️",
            };
        },
    },
});
