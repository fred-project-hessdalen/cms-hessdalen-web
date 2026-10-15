import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"

const require = createRequire(import.meta.url)

function loadModule(path, dependencies, env = {}) {
    const source = readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8")
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
        },
    }).outputText
    const exports = {}
    vm.runInNewContext(compiled, {
        exports, Response, Request, URL, Date,
        process: { env },
        console: { error() { } },
        require(name) {
            if (name === "react/jsx-runtime") return require(name)
            assert.ok(name in dependencies, `Unexpected dependency: ${name}`)
            return dependencies[name]
        },
    }, { filename: fileURLToPath(new URL(`../src/${path}`, import.meta.url)) })
    return exports
}

function endpoint({ session = { user: { id: "user-1", email: "member@example.com" } }, allowed = true, result = { data: { id: "email-1" }, error: null }, configured = true, throws = false } = {}) {
    const sends = []
    const route = loadModule("app/api/test-resend/route.ts", {
        "@/lib/auth": { auth: async () => session },
        "@/lib/auth/core-team": { isCoreTeamMember: async () => allowed },
        resend: {
            Resend: class {
                emails = {
                    send: async (...args) => {
                        sends.push(args)
                        if (throws) throw new Error("Network failure")
                        return result
                    }
                }
            }
        },
    }, configured ? { RESEND_API_KEY: "test-only", EMAIL_FROM: "test@hessdalen.org" } : {})
    return { ...route, sends }
}

function request(origin = "https://www.hessdalen.org") {
    return new Request("https://www.hessdalen.org/api/test-resend", {
        method: "POST",
        headers: { origin, "Content-Type": "application/json" },
        body: JSON.stringify({ to: "someone-else@example.com" }),
    })
}

test("only the Core Team membership slug authorizes access, using a fresh published lookup", async () => {
    for (const membershipSlug of ["core-team-member", "team-member", null, undefined]) {
        const { isCoreTeamMember } = loadModule("lib/auth/core-team.ts", {
            "next-sanity": { defineQuery: query => query },
            "@/lib/sanity/live": {
                client: {
                    withConfig(options) {
                        assert.equal(options.useCdn, false)
                        assert.equal(options.perspective, "published")
                        return {
                            fetch: async (query, params, fetchOptions) => {
                                assert.match(query, /membershipType->slug.current/)
                                assert.equal(params.email, "member@example.com")
                                assert.equal(fetchOptions.cache, "no-store")
                                return membershipSlug === undefined ? null : { membershipSlug }
                            }
                        }
                    }
                }
            },
        })
        assert.equal(await isCoreTeamMember(" MEMBER@EXAMPLE.COM "), membershipSlug === "core-team-member")
    }
})

test("Sanity failures deny Core Team access", async () => {
    const { isCoreTeamMember } = loadModule("lib/auth/core-team.ts", {
        "next-sanity": { defineQuery: query => query },
        "@/lib/sanity/live": { client: { withConfig: () => ({ fetch: async () => { throw new Error("Unavailable") } }) } },
    })
    assert.equal(await isCoreTeamMember("member@example.com"), false)
})

for (const [name, options, origin, expectedStatus] of [
    ["signed-out requests", { session: null }, undefined, 401],
    ["other members", { allowed: false }, undefined, 403],
    ["cross-origin requests", {}, "https://other.example", 403],
    ["missing origin", {}, "", 403],
    ["missing email configuration", { configured: false }, undefined, 503],
]) {
    test(`${name} cannot send email`, async () => {
        const route = endpoint(options)
        assert.equal((await route.POST(request(origin))).status, expectedStatus)
        assert.equal(route.sends.length, 0)
        assert.equal(route.GET, undefined)
    })
}

test("Core Team sends only to the session email and deduplicates requests within a minute", async () => {
    const route = endpoint()
    const response = await route.POST(request())
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { success: true, id: "email-1" })
    assert.equal(route.sends[0][0].to, "member@example.com")
    assert.equal(route.sends[0][0].from, "test@hessdalen.org")
    assert.match(route.sends[0][1].idempotencyKey, /^dashboard-test\/user-1\/\d+$/)
})

test("Resend returned errors and missing IDs are not success", async () => {
    for (const result of [{ data: null, error: { message: "Rejected" } }, { data: null, error: null }]) {
        const response = await endpoint({ result }).POST(request())
        assert.equal(response.status, 502)
        assert.equal((await response.json()).success, undefined)
    }
})

test("unexpected sending failures return a safe error", async () => {
    const response = await endpoint({ throws: true }).POST(request())
    assert.equal(response.status, 500)
    assert.doesNotMatch(JSON.stringify(await response.json()), /Network failure|test-only/)
})

test("the dashboard renders the test control only for Core Team Members", async () => {
    for (const allowed of [false, true]) {
        const { default: Dashboard } = loadModule("app/member/dashboard/page.tsx", {
            "@/lib/auth": { auth: async () => ({ user: { email: "member@example.com" } }) },
            "next/navigation": { redirect() { throw new Error("Unexpected redirect") } },
            "next/link": { default: ({ children, ...props }) => createElement("a", props, children) },
            "@/components/PeopleCard": { PeopleCard: () => null },
            "@/lib/sanity/fetch": { fetchAndParse: async () => null },
            "@/lib/sanity/query/people.query": { PEOPLE_BY_EMAIL_QUERY: "", People: {} },
            "@/lib/auth/core-team": { isCoreTeamMember: async () => allowed },
            "@/components/TestResendEmail": { TestResendEmail: () => createElement("button", null, "Send test email") },
        })
        const html = renderToStaticMarkup(await Dashboard())
        assert.equal(html.includes("Send test email"), allowed)
    }
})