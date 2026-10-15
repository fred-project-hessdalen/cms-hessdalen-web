import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadModule(path) {
    const source = readFileSync(new URL(`../src/lib/${path}`, import.meta.url), "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(compiled, { exports, require, crypto: webcrypto, URL });
    return exports;
}

const { htmlToPortableText } = loadModule("htmlToPortableText.ts");
const { portableTextToHtml } = loadModule("portableTextToHtml.ts");
const blockText = block => block.children.map(span => span.text).join("");

function normalize(blocks) {
    return JSON.parse(JSON.stringify(blocks.map(block => ({
        style: block.style || "normal",
        listItem: block.listItem || null,
        level: block.level || null,
        children: blockText(block).trim() === "" ? [] : block.children.map(span => ({
            text: span.text,
            marks: (span.marks || []).map(mark => {
                const annotation = block.markDefs?.find(definition => definition._key === mark);
                return annotation ? `${annotation._type}:${annotation.href}` : mark;
            }).sort(),
        })),
    }))));
}

test("nested HTML preserves headings and separate paragraphs", () => {
    const blocks = htmlToPortableText("<div><h1>Heading</h1><h2>Subheading</h2><p>First</p><p>Second</p></div>");
    assert.equal(blocks.map(block => block.style).join(","), "h1,h2,normal,normal");
    assert.equal(blocks.map(blockText).join("|"), "Heading|Subheading|First|Second");
});

test("browser-generated Enter divs remain separate lines", () => {
    const blocks = htmlToPortableText("First<div>Second</div><div>Third</div>");
    assert.equal(blocks.map(blockText).join("|"), "First|Second|Third");
});

test("soft breaks and blank paragraphs survive conversion", () => {
    const softBreaks = htmlToPortableText("<p>First<br>Second<br><br>Fourth</p>");
    assert.equal(blockText(softBreaks[0]), "First\nSecond\n\nFourth");
    const paragraphs = htmlToPortableText("<p>Before</p><p><br></p><p>After</p>");
    assert.equal(paragraphs.length, 3);
    assert.equal(blockText(paragraphs[1]).trim(), "");
    assert.match(portableTextToHtml(paragraphs), /<p><br\s*\/><\/p>/);
});

test("inline marks apply only to the words that were formatted", () => {
    const blocks = htmlToPortableText("<p>Plain <strong>bold <em>both</em></strong> and <u>underlined</u>.</p>");
    const spans = blocks[0].children;
    assert.ok(spans.some(span => span.text.includes("Plain") && span.marks.length === 0));
    assert.ok(spans.some(span => span.text === "both" && span.marks.includes("strong") && span.marks.includes("em")));
    assert.ok(spans.some(span => span.text === "underlined" && span.marks.includes("underline")));
    assert.equal(blockText(blocks[0]), "Plain bold both and underlined.");
});

test("bullet, numbered, and nested list structure is preserved", () => {
    const blocks = htmlToPortableText("<ul><li>Bullet<ul><li>Nested</li></ul></li></ul><ol><li>Numbered</li></ol>");
    assert.ok(blocks.some(block => block.listItem === "bullet" && block.level === 1));
    assert.ok(blocks.some(block => block.listItem === "bullet" && block.level === 2));
    assert.ok(blocks.some(block => block.listItem === "number"));
    const html = portableTextToHtml(blocks);
    assert.ok(html.includes("<ul>"));
    assert.ok(html.includes("<ol>"));
});

test("saving, opening for editing, and saving again preserves formatting", () => {
    const html = '<div><h1>Heading</h1><h2>Subheading</h2><p>Plain <strong>bold</strong> and <em>italic</em> <u>underlined</u><br>Next line</p><p><br></p><ul><li>First</li><li>Second</li></ul><p><a href="https://example.com">Link</a></p></div>';
    const saved = htmlToPortableText(html);
    const editable = portableTextToHtml(saved);
    assert.ok(editable.includes("<h1>Heading</h1>"));
    assert.ok(editable.includes("<h2>Subheading</h2>"));
    assert.ok(editable.includes("<strong>bold</strong>"));
    assert.ok(editable.includes("<u>underlined</u>"));
    assert.deepEqual(normalize(htmlToPortableText(editable)), normalize(saved));
});

test("executable HTML and unsafe URLs are not saved", () => {
    const blocks = htmlToPortableText('<p>Safe<script>alert("bad")</script><a href="javascript:alert(1)">Text</a><a href="https://example.com">Good</a></p>');
    assert.equal(blocks.map(blockText).join(""), "SafeTextGood");
    const annotations = blocks.flatMap(block => block.markDefs || []);
    assert.ok(annotations.some(annotation => annotation.href === "https://example.com"));
    assert.ok(!annotations.some(annotation => annotation.href?.startsWith("javascript:")));
    assert.ok(!portableTextToHtml(blocks).includes("<script"));
});

test("literal HTML-looking text is escaped when reopening the editor", () => {
    const blocks = htmlToPortableText("<p>&lt;script&gt;literal&lt;/script&gt; &amp; text</p>");
    const html = portableTextToHtml(blocks);
    assert.ok(html.includes("&lt;script&gt;literal&lt;/script&gt;"));
    assert.ok(!html.includes("<script>"));
});

test("empty input remains a valid Portable Text paragraph", () => {
    const blocks = htmlToPortableText("");
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]._type, "block");
    assert.ok(blocks[0]._key);
    assert.ok(blocks[0].children.length > 0);
});

test("both forum edit actions use the serializer and the dialog uses the rich text editor", () => {
    for (const file of ["EditForumPostButton.tsx", "EditForumResponseButton.tsx"]) {
        const source = readFileSync(new URL(`../src/components/${file}`, import.meta.url), "utf8");
        assert.ok(source.includes("initialBody={portableTextToHtml("));
        assert.ok(!source.includes("const bodyToHtml"));
    }
    const modal = readFileSync(new URL("../src/components/EditForumItemModal.tsx", import.meta.url), "utf8");
    assert.ok(modal.includes("<RichTextEditor"));
    assert.ok(!modal.includes("<textarea"));
});