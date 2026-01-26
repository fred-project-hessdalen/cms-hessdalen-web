import { defineType } from "sanity";

export const separatorType = defineType({
    name: "separator",
    title: "Separator",
    type: "object",
    fields: [
        {
            name: "style",
            title: "Style",
            type: "string",
            options: {
                list: [
                    { title: "Subtle", value: "subtle" },
                    { title: "Prominent", value: "prominent" },
                ],
                layout: "radio",
            },
            initialValue: "subtle",
        },
        {
            name: "showLine",
            title: "Show Horizontal Line",
            type: "boolean",
            initialValue: true,
        },
    ],
    preview: {
        select: {
            style: "style",
            showLine: "showLine",
        },
        prepare({ style, showLine }) {
            return {
                title: `Separator - ${style}`,
                subtitle: showLine ? "With line" : "Without line",
            };
        },
    },
});
