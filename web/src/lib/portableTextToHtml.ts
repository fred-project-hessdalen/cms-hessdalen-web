import { toHTML } from "@portabletext/to-html";
import type { PortableTextBlock } from "sanity";

export function portableTextToHtml(blocks: PortableTextBlock[]): string {
    return toHTML(blocks.filter(block => block._type === "block"), {
        components: {
            block: {
                normal: ({ children }) => `<p>${children || "<br/>"}</p>`,
            },
            marks: {
                underline: ({ children }) => `<u>${children}</u>`,
            },
        },
    });
}