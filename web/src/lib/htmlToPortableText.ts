import { htmlToBlocks } from "@portabletext/block-tools";
import { Schema } from "@sanity/schema";
import { JSDOM } from "jsdom";
import type { PortableTextBlock } from "sanity";

const bodySchema = Schema.compile({
    name: "forumContent",
    types: [{
        name: "forumBody",
        type: "array",
        of: [{
            type: "block",
            styles: [
                { title: "Normal", value: "normal" },
                { title: "Heading 1", value: "h1" },
                { title: "Heading 2", value: "h2" },
                { title: "Heading 3", value: "h3" },
                { title: "Heading 4", value: "h4" },
                { title: "Heading 5", value: "h5" },
                { title: "Heading 6", value: "h6" },
                { title: "Quote", value: "blockquote" },
            ],
            lists: [{ title: "Bullet", value: "bullet" }, { title: "Number", value: "number" }],
            marks: {
                decorators: [
                    { title: "Bold", value: "strong" },
                    { title: "Italic", value: "em" },
                    { title: "Underline", value: "underline" },
                    { title: "Strike through", value: "strike-through" },
                    { title: "Code", value: "code" },
                ],
                annotations: [{
                    name: "link",
                    type: "object",
                    fields: [{ name: "href", type: "url" }],
                }],
            },
        }],
    }],
}).get("forumBody");

export function htmlToPortableText(html: string): PortableTextBlock[] {
    const documents: JSDOM[] = [];
    try {
        const blocks = htmlToBlocks(html || "<p></p>", bodySchema, {
            unstable_whitespaceOnPasteMode: "preserve",
            keyGenerator: () => crypto.randomUUID(),
            parseHtml: source => {
                const dom = new JSDOM(source);
                documents.push(dom);
                const document = dom.window.document;
                document.querySelectorAll("script, style, iframe, object, embed").forEach(element => element.remove());
                Array.from(document.querySelectorAll("div")).reverse().forEach(element => {
                    if (element.querySelector("p, div, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote, pre")) return;
                    const paragraph = document.createElement("p");
                    paragraph.append(...Array.from(element.childNodes));
                    element.replaceWith(paragraph);
                });
                document.querySelectorAll("a[href]").forEach(link => {
                    try {
                        const url = new URL(link.getAttribute("href") || "", "https://forum.invalid");
                        if (!["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) link.removeAttribute("href");
                    } catch {
                        link.removeAttribute("href");
                    }
                });
                return document;
            },
        }) as PortableTextBlock[];

        return blocks.length > 0 ? blocks : [{
            _type: "block",
            _key: crypto.randomUUID(),
            style: "normal",
            children: [{ _type: "span", _key: crypto.randomUUID(), text: "", marks: [] }],
            markDefs: [],
        }];
    } finally {
        documents.forEach(dom => dom.window.close());
    }
}