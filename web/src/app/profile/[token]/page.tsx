import { fetchAndParse } from "@/lib/sanity/fetch"
import { ProfileEditForm } from "@/components/ProfileEditForm"
import { z } from "zod"

const PROFILE_BY_TOKEN_QUERY = `
  *[_type == "person" && profileToken == $token][0] {
    _id,
    name,
    email,
    mobileNumber,
    isPublic,
    canShowEmail,
    canShowMobileNumber
  }
`

const ProfileSchema = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    mobileNumber: z.preprocess(v => v ?? undefined, z.string().optional()),
    isPublic: z.preprocess(v => v ?? true, z.boolean()),
    canShowEmail: z.preprocess(v => v ?? false, z.boolean()),
    canShowMobileNumber: z.preprocess(v => v ?? false, z.boolean()),
})

export default async function ProfileEditPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params

    const person = await fetchAndParse(
        PROFILE_BY_TOKEN_QUERY,
        { token } as Record<string, unknown>,
        ProfileSchema
    ).catch(() => null)

    if (!person) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        This profile editing link is invalid or has expired.
                        Please contact an administrator for a new link.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <ProfileEditForm person={person} token={token} />
        </div>
    )
}
