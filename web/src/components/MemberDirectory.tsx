"use client"

import { useState, type ReactNode } from "react"
import { Copy, Globe } from "lucide-react"

export type DirectoryMembershipType = { _id: string; title: string }
export type DirectoryMember = {
    _id: string
    name: string | null
    email: string | null
    isPublic: boolean | null
    signupDate: string
    membershipType: DirectoryMembershipType | null
}
export type MemberDirectoryData = {
    members: DirectoryMember[]
    membershipTypes: DirectoryMembershipType[]
}
export type SignupPeriod = "all" | "week" | "month" | "3months" | "6months" | "year"

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
})

export function getSignupCutoff(period: SignupPeriod, now: Date): Date | null {
    if (period === "all") return null
    if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const months = { month: 1, "3months": 3, "6months": 6, year: 12 }[period]
    const cutoff = new Date(now)
    const day = cutoff.getUTCDate()
    cutoff.setUTCDate(1)
    cutoff.setUTCMonth(cutoff.getUTCMonth() - months)
    const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate()
    cutoff.setUTCDate(Math.min(day, lastDay))
    return cutoff
}

export function filterDirectoryMembers(
    members: DirectoryMember[], period: SignupPeriod, membershipTypes: readonly string[] | null, now: Date, nameSearch = ""
): DirectoryMember[] {
    const cutoff = getSignupCutoff(period, now)
    const search = nameSearch.trim().toLowerCase()
    return members.filter(member => {
        const signupDate = new Date(member.signupDate).getTime()
        return (membershipTypes === null || (member.membershipType !== null && membershipTypes.includes(member.membershipType._id)))
            && (!search || (member.name ?? "").toLowerCase().includes(search))
            && (!cutoff || (signupDate >= cutoff.getTime() && signupDate <= now.getTime()))
    })
}

export function getMemberEmailAddresses(members: DirectoryMember[], selectedIds: ReadonlySet<string>): string[] {
    const seen = new Set<string>()
    const emails: string[] = []
    for (const member of members) {
        if (selectedIds.size > 0 && !selectedIds.has(member._id)) continue
        const email = member.email?.trim()
        if (!email || seen.has(email.toLowerCase())) continue
        seen.add(email.toLowerCase())
        emails.push(email)
    }
    return emails
}

export function MemberDirectory({ data, children }: { data: MemberDirectoryData | null; children?: ReactNode }) {
    const [nameSearch, setNameSearch] = useState("")
    const [period, setPeriod] = useState<SignupPeriod>("all")
    const [membershipTypes, setMembershipTypes] = useState<string[] | null>(null)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [copyFeedback, setCopyFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null)
    const members = filterDirectoryMembers(data?.members ?? [], period, membershipTypes, new Date(), nameSearch)
    const allSelected = members.length > 0 && members.every(member => selectedIds.has(member._id))
    const emailAddresses = getMemberEmailAddresses(members, selectedIds)

    function clearSelection() {
        setSelectedIds(new Set())
        setCopyFeedback(null)
    }

    async function copyEmailList() {
        try {
            await navigator.clipboard.writeText(emailAddresses.join(", "))
            setCopyFeedback({ kind: "success", text: `Copied ${emailAddresses.length} email ${emailAddresses.length === 1 ? "address" : "addresses"}.` })
        } catch {
            setCopyFeedback({ kind: "error", text: "Could not copy. Allow clipboard access and try again." })
        }
    }

    function toggleMember(id: string) {
        setCopyFeedback(null)
        setSelectedIds(current => {
            const next = new Set(current)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    function toggleMembershipType(id: string) {
        setMembershipTypes(current => {
            const selected = current ?? data?.membershipTypes.map(type => type._id) ?? []
            return selected.includes(id) ? selected.filter(typeId => typeId !== id) : [...selected, id]
        })
        clearSelection()
    }

    const actions = (
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="min-w-0">
                <button
                    type="button"
                    onClick={copyEmailList}
                    disabled={emailAddresses.length === 0}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                    <Copy aria-hidden="true" className="h-4 w-4 shrink-0" />
                    Copy email list
                </button>
                <div aria-live="polite" aria-atomic="true" className="mt-3 text-sm">
                    {copyFeedback && <p className={copyFeedback.kind === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>{copyFeedback.text}</p>}
                </div>
            </div>
            {children}
        </div>
    )

    if (!data) {
        return (
            <section className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Members</h2>
                <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
                    Unable to load members. Please refresh to try again.
                </p>
                {actions}
            </section>
        )
    }

    return (
        <section aria-labelledby="member-directory-heading" className="mt-8 min-w-0 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="member-directory-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">Members</h2>
                <p aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400">
                    {members.length} {members.length === 1 ? "member" : "members"} / {selectedIds.size} selected
                </p>
            </div>
            <div role="group" aria-label="Member filters" className="mb-5 grid items-start gap-4 rounded-md border border-gray-300 bg-white p-4 text-left dark:border-gray-600 dark:bg-gray-800 md:grid-cols-3">
                <div className="min-w-0">
                    <label htmlFor="member-name-search" className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300">Search by name</label>
                    <input
                        id="member-name-search"
                        type="search"
                        value={nameSearch}
                        onChange={event => { setNameSearch(event.target.value); clearSelection() }}
                        className="min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                </div>
                <fieldset id="member-signup-period" className="min-w-0">
                    <legend className="mb-2 w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300">Signup date</legend>
                    <div className="space-y-2">
                        {([
                            ["all", "All time"],
                            ["week", "Last week"],
                            ["month", "Last month"],
                            ["3months", "Last 3 months"],
                            ["6months", "Last half year"],
                            ["year", "Last year"],
                        ] as const).map(([value, label]) => (
                            <label key={value} className="flex cursor-pointer items-start gap-2 text-sm text-gray-900 dark:text-gray-100">
                                <input
                                    type="radio"
                                    name="member-signup-period"
                                    value={value}
                                    checked={period === value}
                                    onChange={() => { setPeriod(value); clearSelection() }}
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                                />
                                <span className="break-words">{label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <fieldset className="min-w-0">
                    <legend className="mb-2 w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300">Membership type</legend>
                    <div className="space-y-2" style={{ maxHeight: "180px", overflowY: "auto" }}>
                        <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-900 dark:text-gray-100">
                            <input
                                type="checkbox"
                                checked={membershipTypes === null}
                                ref={node => { if (node) node.indeterminate = membershipTypes !== null && membershipTypes.length > 0 }}
                                onChange={event => { setMembershipTypes(event.target.checked ? null : []); clearSelection() }}
                                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                            />
                            <span className="break-words">All membership types</span>
                        </label>
                        {data.membershipTypes.map(type => (
                            <label key={type._id} className="flex cursor-pointer items-start gap-2 text-sm text-gray-900 dark:text-gray-100">
                                <input
                                    type="checkbox"
                                    checked={membershipTypes === null || membershipTypes.includes(type._id)}
                                    onChange={() => toggleMembershipType(type._id)}
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                                />
                                <span className="break-words">{type.title}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            </div>
            <div
                role="region"
                aria-label="Member list"
                tabIndex={0}
                className="w-full"
                style={{ maxHeight: "500px", overflowY: "auto", overflowX: "auto", overscrollBehavior: "contain" }}
            >
                <table className="w-full min-w-[640px] table-fixed text-left text-sm text-gray-900 dark:text-gray-100">
                    <caption className="sr-only">Members, newest first. Signup date is the date the People record was created.</caption>
                    <thead className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="w-10 px-2 py-3">
                                <input
                                    type="checkbox"
                                    aria-label="Select all matching members"
                                    checked={allSelected}
                                    disabled={members.length === 0}
                                    ref={node => { if (node) node.indeterminate = selectedIds.size > 0 && !allSelected }}
                                    onChange={() => { setSelectedIds(allSelected ? new Set() : new Set(members.map(member => member._id))); setCopyFeedback(null) }}
                                    className="h-4 w-4 accent-blue-600"
                                />
                            </th>
                            <th scope="col" className="px-2 py-3 font-medium">Name</th>
                            <th scope="col" className="px-2 py-3 font-medium">Email</th>
                            <th scope="col" className="px-2 py-3 font-medium">Membership type</th>
                            <th scope="col" aria-label="Public website visibility" className="w-10 px-2 py-3" />
                            <th scope="col" className="w-28 px-2 py-3 font-medium" title="Date the People record was created">Signup date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {members.map(member => (
                            <tr key={member._id} className={selectedIds.has(member._id) ? "bg-blue-50 dark:bg-blue-950" : ""}>
                                <td className="px-2 py-3 align-top">
                                    <input type="checkbox" aria-label={`Select ${member.name || member.email || "member"}`} checked={selectedIds.has(member._id)} onChange={() => toggleMember(member._id)} className="h-4 w-4 accent-blue-600" />
                                </td>
                                <td className="break-words px-2 py-3 align-top font-medium">{member.name || "Not provided"}</td>
                                <td className="break-all px-2 py-3 align-top">
                                    {member.email ? <a href={`mailto:${member.email}`} className="text-blue-700 underline-offset-2 hover:underline dark:text-blue-400">{member.email}</a> : "Not provided"}
                                </td>
                                <td className="break-words px-2 py-3 align-top">{member.membershipType?.title || "Not assigned"}</td>
                                <td className="px-2 py-3 align-top">
                                    <span
                                        role="img"
                                        aria-label={member.isPublic === true ? "Shown on public website" : "Not shown on public website"}
                                        title={member.isPublic === true ? "Shown on public website" : "Not shown on public website"}
                                        className={member.isPublic === true ? "inline-flex text-green-700 dark:text-green-400" : "inline-flex text-red-700 dark:text-red-400"}
                                    >
                                        {member.isPublic === true ? <Globe aria-hidden="true" className="h-4 w-4" /> : <span aria-hidden="true" className="text-lg leading-none">🚫</span>}
                                    </span>
                                </td>
                                <td className="px-2 py-3 align-top"><time dateTime={member.signupDate}>{dateFormatter.format(new Date(member.signupDate))}</time></td>
                            </tr>
                        ))}
                        {members.length === 0 && <tr><td colSpan={6} className="px-2 py-8 text-center text-gray-500 dark:text-gray-400">No members match these filters.</td></tr>}
                    </tbody>
                </table>
            </div>
            {actions}
        </section>
    )
}