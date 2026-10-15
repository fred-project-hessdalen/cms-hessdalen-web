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
            if (name === "react/jsx-runtime" || name === "react" || name === "lucide-react") return require(name)
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
    for (const membershipSlug of ["core", "team", "project", "fascination", "curiosity", "core-team-member", null, undefined]) {
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
        assert.equal(await isCoreTeamMember(" MEMBER@EXAMPLE.COM "), membershipSlug === "core")
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

test("the dashboard fetches and renders member data and the test control only for Core Team Members", async () => {
    for (const allowed of [false, true]) {
        let directoryFetches = 0
        const { default: Dashboard } = loadModule("app/member/dashboard/page.tsx", {
            "@/lib/auth": { auth: async () => ({ user: { email: "member@example.com" } }) },
            "next/navigation": { redirect() { throw new Error("Unexpected redirect") } },
            "next/link": { default: ({ children, ...props }) => createElement("a", props, children) },
            "@/components/PeopleCard": { PeopleCard: () => null },
            "@/lib/sanity/fetch": { fetchAndParse: async () => null },
            "@/lib/sanity/query/people.query": { PEOPLE_BY_EMAIL_QUERY: "", People: {} },
            "@/lib/auth/core-team": { isCoreTeamMember: async () => allowed },
            "@/components/TestResendEmail": { TestResendEmail: () => createElement("button", null, "Send test email") },
            "@/components/MemberDirectory": { MemberDirectory: ({ data, children }) => createElement("section", null, "Member directory ", data.members[0].email, children) },
            "next-sanity": { defineQuery: query => query },
            "@/lib/sanity/live": {
                client: {
                    withConfig(options) {
                        assert.equal(options.useCdn, false)
                        assert.equal(options.perspective, "published")
                        return {
                            fetch: async (query, params, fetchOptions) => {
                                directoryFetches++
                                assert.match(query, /_type == "person" && isActive == true/)
                                assert.match(query, /\bisPublic\s*,/)
                                assert.match(query, /"signupDate": _createdAt/)
                                assert.doesNotMatch(query, /isPublic\s*==|canShowEmail/)
                                assert.equal(fetchOptions.cache, "no-store")
                                return { members: [{ email: "directory@example.com" }], membershipTypes: [] }
                            }
                        }
                    }
                }
            },
        })
        const html = renderToStaticMarkup(await Dashboard())
        assert.equal(html.includes("Core Team Member features"), allowed)
        assert.equal(html.includes('aria-labelledby="core-team-features-heading"'), allowed)
        assert.equal(html.includes("Send test email"), allowed)
        assert.equal(html.includes("Member directory"), allowed)
        assert.equal(html.includes("directory@example.com"), allowed)
        assert.equal(directoryFetches, allowed ? 1 : 0)
    }
})

test("signup periods use rolling weeks and calendar months with inclusive boundaries", () => {
    const { getSignupCutoff, filterDirectoryMembers } = loadModule("components/MemberDirectory.tsx", {})
    const now = new Date("2026-10-15T12:00:00Z")
    for (const [period, date] of [
        ["week", "2026-10-08T12:00:00.000Z"],
        ["month", "2026-09-15T12:00:00.000Z"],
        ["3months", "2026-07-15T12:00:00.000Z"],
        ["6months", "2026-04-15T12:00:00.000Z"],
        ["year", "2025-10-15T12:00:00.000Z"],
    ]) {
        assert.equal(getSignupCutoff(period, now).toISOString(), date)
        const members = [
            { _id: "boundary", signupDate: date },
            { _id: "before", signupDate: new Date(new Date(date).getTime() - 1).toISOString() },
            { _id: "now", signupDate: now.toISOString() },
            { _id: "future", signupDate: "2026-10-16T00:00:00Z" },
        ]
        assert.equal(filterDirectoryMembers(members, period, null, now).map(member => member._id).join(","), "boundary,now")
    }
    assert.equal(getSignupCutoff("all", now), null)
    assert.equal(getSignupCutoff("month", new Date("2024-03-31T12:00:00Z")).toISOString(), "2024-02-29T12:00:00.000Z")
    assert.equal(getSignupCutoff("year", new Date("2024-02-29T12:00:00Z")).toISOString(), "2023-02-28T12:00:00.000Z")
})

test("membership and date filters combine without hiding people with unassigned membership in all types", () => {
    const { filterDirectoryMembers } = loadModule("components/MemberDirectory.tsx", {})
    const members = [
        { _id: "core-new", signupDate: "2026-10-14T00:00:00Z", membershipType: { _id: "core" } },
        { _id: "core-old", signupDate: "2025-01-01T00:00:00Z", membershipType: { _id: "core" } },
        { _id: "team", signupDate: "2026-10-14T00:00:00Z", membershipType: { _id: "team" } },
        { _id: "unassigned", signupDate: "2026-10-14T00:00:00Z", membershipType: null },
    ]
    const now = new Date("2026-10-15T12:00:00Z")
    assert.equal(filterDirectoryMembers(members, "all", null, now).length, 4)
    assert.equal(filterDirectoryMembers(members, "all", ["core"], now).length, 2)
    assert.equal(filterDirectoryMembers(members, "week", ["core"], now)[0]._id, "core-new")
    assert.equal(filterDirectoryMembers(members, "week", null, now).length, 3)
    assert.equal(filterDirectoryMembers(members, "all", ["unknown"], now).length, 0)
    assert.equal(filterDirectoryMembers(members, "all", ["core", "team"], now).length, 3)
    assert.equal(filterDirectoryMembers(members, "week", ["core", "team"], now).length, 2)
    assert.equal(filterDirectoryMembers(members, "all", [], now).length, 0)
})

test("name search is case-insensitive, trims whitespace, and combines with multiple types and signup dates", () => {
    const { filterDirectoryMembers } = loadModule("components/MemberDirectory.tsx", {})
    const now = new Date("2026-10-15T12:00:00Z")
    const members = [
        { _id: "core", name: "Alice Smith", signupDate: "2026-10-14T00:00:00Z", membershipType: { _id: "core" } },
        { _id: "team", name: "ALICE Jones", signupDate: "2026-10-14T00:00:00Z", membershipType: { _id: "team" } },
        { _id: "old", name: "Alice Old", signupDate: "2025-01-01T00:00:00Z", membershipType: { _id: "core" } },
        { _id: "other", name: "Bob Smith", signupDate: "2026-10-14T00:00:00Z", membershipType: { _id: "core" } },
        { _id: "unnamed", name: null, signupDate: "2026-10-14T00:00:00Z", membershipType: null },
    ]
    assert.equal(filterDirectoryMembers(members, "all", null, now, "  alice  ").length, 3)
    assert.equal(filterDirectoryMembers(members, "week", ["core", "team"], now, "alice").length, 2)
    assert.equal(filterDirectoryMembers(members, "week", ["team"], now, "alice")[0]._id, "team")
    assert.equal(filterDirectoryMembers(members, "all", null, now, "  ").length, 5)
    assert.equal(filterDirectoryMembers(members, "all", null, now, "missing").length, 0)
})

test("member directory renders all matching members in a height-limited scroll region without pagination", () => {
    const { MemberDirectory } = loadModule("components/MemberDirectory.tsx", {})
    const members = Array.from({ length: 51 }, (_, index) => ({
        _id: `person-${index}`, name: `Member ${index}`, email: `member${index}@example.com`,
        isPublic: index % 2 === 0,
        signupDate: "2026-10-14T12:00:00Z", membershipType: { _id: "core", title: "Core Team Member" },
    }))
    const html = renderToStaticMarkup(createElement(MemberDirectory, {
        data: { members, membershipTypes: [{ _id: "core", title: "Core Team Member" }] },
    }))
    for (const text of ["Name", "Email", "Membership type", "Signup date", "Last week", "Last month", "Last 3 months", "Last half year", "Last year", "All time", "Select all matching members", "member0@example.com", "member50@example.com", "Core Team Member", "14 Oct 2026", "max-height:500px", "overflow-y:auto", "overflow-x:auto", "sticky top-0"]) {
        assert.ok(html.includes(text), `Missing directory content: ${text}`)
    }
    assert.ok(!html.includes("Member list pages"))
    assert.ok(html.includes('aria-label="Member filters"'))
    assert.ok(html.includes("md:grid-cols-3"))
    assert.ok(html.indexOf('id="member-name-search"') < html.indexOf('id="member-signup-period"'))
    assert.match(html, /<legend[^>]*>Signup date<\/legend>/)
    const signupRadios = html.match(/<input\b[^>]*type="radio"[^>]*>/g) ?? []
    assert.equal(signupRadios.length, 6)
    assert.ok(signupRadios.every(radio => radio.includes('name="member-signup-period"')))
    assert.equal(signupRadios.filter(radio => radio.includes('checked=""')).length, 1)
    assert.ok(signupRadios.some(radio => radio.includes('value="all"') && radio.includes('checked=""')))
    assert.ok(!html.includes("<select"))
    assert.match(html, /<legend[^>]*>Membership type<\/legend>/)
    assert.match(html, /type="checkbox"[^>]*checked=""[^>]*\/><span[^>]*>All membership types/)
    assert.ok(!html.includes('id="member-membership-type"'))
    assert.ok(html.includes('aria-label="Public website visibility"'))
    assert.ok(html.includes('title="Shown on public website"'))
    assert.ok(html.includes('title="Not shown on public website"'))
    assert.ok(!html.includes(">Previous</button>"))
    assert.ok(!html.includes(">Next</button>"))
    const empty = renderToStaticMarkup(createElement(MemberDirectory, { data: { members: [], membershipTypes: [] } }))
    assert.ok(empty.includes("No members match these filters."))
    const error = renderToStaticMarkup(createElement(MemberDirectory, { data: null }))
    assert.ok(error.includes("Unable to load members."))
})

test("the unlabeled visibility column follows membership type and shows a globe only for explicit public visibility", () => {
    const { MemberDirectory } = loadModule("components/MemberDirectory.tsx", {})
    for (const isPublic of [true, false, null, undefined]) {
        const html = renderToStaticMarkup(createElement(MemberDirectory, {
            data: {
                members: [{ _id: "person-1", name: "Test Member", email: "member@example.com", isPublic, signupDate: "2026-10-14T12:00:00Z", membershipType: null }],
                membershipTypes: [],
            },
        }))
        assert.match(html, /Membership type<\/th><th[^>]*aria-label="Public website visibility"[^>]*><\/th><th[^>]*title="Date the People record was created"/)
        assert.equal(html.includes('aria-label="Shown on public website"'), isPublic === true)
        assert.equal(html.includes('aria-label="Not shown on public website"'), isPublic !== true)
        assert.equal(html.includes("lucide-globe"), isPublic === true)
        assert.equal(html.includes("\u{1F6AB}"), isPublic !== true)
    }
})

test("copy email list uses all filtered members or only selected members, trimming and deduplicating addresses", () => {
    const { getMemberEmailAddresses } = loadModule("components/MemberDirectory.tsx", {})
    const members = [
        { _id: "alice", email: " alice@example.com " },
        { _id: "bob", email: "bob@example.com" },
        { _id: "duplicate", email: "ALICE@example.com" },
        { _id: "missing", email: null },
        { _id: "blank", email: "  " },
    ]
    assert.equal(getMemberEmailAddresses(members, new Set()).join(", "), "alice@example.com, bob@example.com")
    assert.equal(getMemberEmailAddresses(members, new Set(["bob"])).join(", "), "bob@example.com")
    assert.equal(getMemberEmailAddresses(members, new Set(["alice", "bob"])).join(", "), "alice@example.com, bob@example.com")
    assert.equal(getMemberEmailAddresses(members, new Set(["missing"])).length, 0)
    assert.equal(getMemberEmailAddresses(members, new Set(["not-in-filtered-list"])).length, 0)
    assert.equal(getMemberEmailAddresses([], new Set()).length, 0)
})

test("copy action is left of the email test action with no diagnostics heading", () => {
    const { MemberDirectory } = loadModule("components/MemberDirectory.tsx", {})
    const { TestResendEmail } = loadModule("components/TestResendEmail.tsx", {})
    const data = {
        members: [{ _id: "person-1", name: "Test Member", email: "member@example.com", isPublic: true, signupDate: "2026-10-14T12:00:00Z", membershipType: null }],
        membershipTypes: [],
    }
    const html = renderToStaticMarkup(createElement(MemberDirectory, { data }, createElement(TestResendEmail)))
    assert.ok(html.includes("Copy email list"))
    assert.ok(html.includes("Send test email"))
    assert.ok(html.indexOf("Copy email list") < html.indexOf("Send test email"))
    assert.ok(html.includes("justify-between"))
    assert.ok(html.includes("ml-auto"))
    assert.ok(!html.includes("Email diagnostics"))
    const empty = renderToStaticMarkup(createElement(MemberDirectory, { data: { members: [], membershipTypes: [] } }))
    assert.match(empty, /<button[^>]*disabled=""[^>]*>[\s\S]*?Copy email list/)
})