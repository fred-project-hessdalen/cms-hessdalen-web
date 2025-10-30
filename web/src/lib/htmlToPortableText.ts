import type { PortableTextBlock } from "sanity";

/**
 * Converts HTML content from a rich text editor to Sanity Portable Text blocks
 * Server-side implementation using regex-based parsing
 */
export function htmlToPortableText(html: string): PortableTextBlock[] {
    if (!html || html.trim() === "") {
        return [
            {
                _type: "block",
                _key: crypto.randomUUID(),
                style: "normal",
                children: [
                    {
                        _type: "span",
                        _key: crypto.randomUUID(),
                        text: "",
                        marks: [],
                    },
                ],
                markDefs: [],
            },
        ];
    }

    const blocks: PortableTextBlock[] = [];

    // Helper to strip HTML tags and decode entities
    const stripTags = (str: string): string => {
        return str
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .trim();
    };

    // Helper to extract marks from HTML string
    const extractMarks = (text: string): Array<{ text: string; marks: string[] }> => {
        const spans: Array<{ text: string; marks: string[] }> = [];
        const currentText = text;

        // Simple regex-based mark extraction
        const patterns = [
            { tag: "strong", mark: "strong" },
            { tag: "b", mark: "strong" },
            { tag: "em", mark: "em" },
            { tag: "i", mark: "em" },
            { tag: "u", mark: "underline" },
        ];

        // For now, we'll do a simple extraction
        const hasMarks = patterns.some((p) =>
            currentText.includes(`<${p.tag}>`) || currentText.includes(`<${p.tag} `)
        );

        if (!hasMarks) {
            // No formatting, just return plain text
            const plainText = stripTags(currentText);
            if (plainText) {
                spans.push({
                    text: plainText,
                    marks: [],
                });
            }
        } else {
            // Has formatting - extract it
            const tempText = currentText;
            const marks: string[] = [];

            if (/<(strong|b)>/i.test(tempText)) marks.push("strong");
            if (/<(em|i)>/i.test(tempText)) marks.push("em");
            if (/<u>/i.test(tempText)) marks.push("underline");

            const plainText = stripTags(tempText);
            if (plainText) {
                spans.push({
                    text: plainText,
                    marks,
                });
            }
        }

        return spans;
    };

    // Split HTML into block-level elements
    // Updated regex to also match <div> tags and handle text between blocks
    const blockRegex = /<(h[1-6]|p|li|div)(?:\s[^>]*)?>([^]*?)<\/\1>|<(ul|ol)(?:\s[^>]*)?>([^]*?)<\/\3>/gi;

    // First, let's collect all matches and track positions
    const matches = Array.from(html.matchAll(blockRegex));

    let lastIndex = 0;
    const segments: Array<{ type: 'text' | 'match', content: string, match?: RegExpMatchArray }> = [];

    matches.forEach(match => {
        // Add any text before this match
        if (match.index! > lastIndex) {
            const textBefore = html.substring(lastIndex, match.index);
            if (textBefore.trim()) {
                segments.push({ type: 'text', content: textBefore });
            }
        }
        segments.push({ type: 'match', content: match[0], match });
        lastIndex = match.index! + match[0].length;
    });

    // Add any remaining text after the last match
    if (lastIndex < html.length) {
        const textAfter = html.substring(lastIndex);
        if (textAfter.trim()) {
            segments.push({ type: 'text', content: textAfter });
        }
    }

    if (segments.length === 0) {
        // No block elements found, treat as plain text paragraph
        const plainText = stripTags(html);
        if (plainText) {
            blocks.push({
                _type: "block",
                _key: crypto.randomUUID(),
                style: "normal",
                children: [
                    {
                        _type: "span",
                        _key: crypto.randomUUID(),
                        text: plainText,
                        marks: [],
                    },
                ],
                markDefs: [],
            });
        }
    } else {
        let currentListType: "bullet" | "number" | null = null;

        segments.forEach((segment) => {
            if (segment.type === 'text') {
                // Handle plain text as a paragraph
                const plainText = stripTags(segment.content);
                if (plainText) {
                    blocks.push({
                        _type: "block",
                        _key: crypto.randomUUID(),
                        style: "normal",
                        children: [
                            {
                                _type: "span",
                                _key: crypto.randomUUID(),
                                text: plainText,
                                marks: [],
                            },
                        ],
                        markDefs: [],
                    });
                }
                return;
            }

            const match = segment.match!;
            const tag = (match[1] || match[3]).toLowerCase();
            const content = match[2] || match[4];

            if (tag === "ul" || tag === "ol") {
                // Process list
                currentListType = tag === "ul" ? "bullet" : "number";
                const listItems = Array.from(content.matchAll(/<li(?:\s[^>]*)?>([^]*?)<\/li>/gi));

                listItems.forEach((liMatch) => {
                    const liContent = liMatch[1];
                    const spans = extractMarks(liContent);

                    blocks.push({
                        _type: "block",
                        _key: crypto.randomUUID(),
                        style: "normal",
                        listItem: currentListType!,
                        level: 1,
                        children: spans.map((span) => ({
                            _type: "span",
                            _key: crypto.randomUUID(),
                            text: span.text,
                            marks: span.marks,
                        })),
                        markDefs: [],
                    });
                });

                currentListType = null;
            } else {
                // Process heading, paragraph, or div
                // Treat div as normal paragraph
                const style = tag.startsWith("h") ? tag : "normal";
                const spans = extractMarks(content);

                if (spans.length > 0) {
                    blocks.push({
                        _type: "block",
                        _key: crypto.randomUUID(),
                        style,
                        children: spans.map((span) => ({
                            _type: "span",
                            _key: crypto.randomUUID(),
                            text: span.text,
                            marks: span.marks,
                        })),
                        markDefs: [],
                    });
                }
            }
        });
    }

    // If no blocks were created, add an empty paragraph
    if (blocks.length === 0) {
        blocks.push({
            _type: "block",
            _key: crypto.randomUUID(),
            style: "normal",
            children: [
                {
                    _type: "span",
                    _key: crypto.randomUUID(),
                    text: "",
                    marks: [],
                },
            ],
            markDefs: [],
        });
    }

    return blocks;
}

