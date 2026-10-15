import { defineQuery } from "next-sanity"
import { client } from "@/lib/sanity/live"

const membershipClient = client.withConfig({
    useCdn: false,
    perspective: "published",
})

const MEMBERSHIP_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "person" && lower(email) == $email][0]{
    "membershipSlug": membershipType->slug.current
  }
`)

export async function isCoreTeamMember(email: string): Promise<boolean> {
    try {
        const person = await membershipClient.fetch<{ membershipSlug: string | null } | null>(
            MEMBERSHIP_BY_EMAIL_QUERY,
            { email: email.trim().toLowerCase() },
            { cache: "no-store" }
        )

        return person?.membershipSlug === "core-team-member"
    } catch (error) {
        console.error("Core Team membership verification failed:", error)
        return false
    }
}