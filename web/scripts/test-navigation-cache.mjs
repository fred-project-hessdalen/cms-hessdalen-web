import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(
    new URL("../src/lib/sanity/getSiteNavigation.ts", import.meta.url),
    "utf8"
);
const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
});
const query = {
    NAV_QUERY: "navigation query",
    NAV_MENU: {},
    NAV_TAG: "site-navigation",
};

function loadNavigation(fetchAndParse) {
    const exports = {};
    runInNewContext(outputText, {
        exports,
        require(id) {
            if (id === "@/lib/sanity/fetch") return { fetchAndParse };
            if (id === "@/lib/sanity/query/nav.query") return query;
            throw new Error(`Unexpected import: ${id}`);
        },
    });
    return exports.getSiteNavigation;
}

test("every navigation read uses Next.js revalidation and the invalidation tag", async () => {
    const results = [{ menuItems: [] }, { menuItems: [{ label: "Updated" }] }];
    let calls = 0;
    const getSiteNavigation = loadNavigation(async (groq, params, schema, options) => {
        assert.equal(groq, query.NAV_QUERY);
        assert.equal(Object.keys(params).length, 0);
        assert.equal(schema, query.NAV_MENU);
        assert.equal(options.next.revalidate, 60);
        assert.equal(options.next.tags.length, 1);
        assert.equal(options.next.tags[0], query.NAV_TAG);
        return results[calls++];
    });

    assert.equal(await getSiteNavigation(), results[0]);
    assert.equal(await getSiteNavigation(), results[1]);
    assert.equal(calls, 2);
});

test("a missing navigation document still returns an empty menu", async () => {
    const getSiteNavigation = loadNavigation(async () => null);
    const result = await getSiteNavigation();
    assert.equal(result.menuItems.length, 0);
});

test("navigation fetch and validation errors propagate", async () => {
    const error = new Error("Navigation fetch failed");
    const getSiteNavigation = loadNavigation(async () => {
        throw error;
    });
    await assert.rejects(getSiteNavigation(), (received) => received === error);
});
