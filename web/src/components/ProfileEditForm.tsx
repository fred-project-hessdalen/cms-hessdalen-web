"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"

type ProfileData = {
    name: string
    email: string
    summary?: string
    mobileNumber?: string
    isPublic: boolean
    canShowEmail: boolean
    canShowMobileNumber: boolean
}

export function ProfileEditForm({
    person,
    token
}: {
    person: ProfileData
    token: string
}) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")

    const [formData, setFormData] = useState({
        summary: person.summary || "",
        mobileNumber: person.mobileNumber || "",
        isPublic: person.isPublic ?? true,
        canShowEmail: person.canShowEmail ?? false,
        canShowMobileNumber: person.canShowMobileNumber ?? false,
    })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        try {
            const response = await fetch(`/api/profile/${token}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                setMessage("✅ Profile updated successfully!")
                router.refresh()
            } else {
                const error = await response.json()
                setMessage(`❌ Error: ${error.error}`)
            }
        } catch {
            setMessage("❌ Failed to save changes")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-left" suppressHydrationWarning>
            <h2 className="text-2xl font-bold mb-6 text-left">Edit Your Profile</h2>

            {/* Read-only info */}
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded text-left">
                <p className="text-3xl text-gray-800 dark:text-gray-200 mb-2">
                    <strong>Name:</strong> {person.name}
                </p>
                <p className="text-3xl text-gray-800 dark:text-gray-200">
                    <strong>Email:</strong> {person.email}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                {/* Summary */}
                <div>
                    <label htmlFor="summary" className="block text-sm font-medium mb-2 text-left">
                        Short Summary
                    </label>
                    <textarea
                        id="summary"
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        placeholder="A few lines about yourself..."
                        rows={3}
                        maxLength={280}
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-left resize-none"
                        suppressHydrationWarning
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
                        {formData.summary.length}/280 characters
                    </p>
                </div>

                {/* Mobile Number */}
                <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium mb-2 text-left">
                        Mobile Number
                    </label>
                    <input
                        id="mobileNumber"
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        placeholder="+47 400 00 000"
                        className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-left"
                        suppressHydrationWarning
                    />
                </div>

                {/* Privacy Checkboxes */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg text-left">Privacy Settings</h3>

                    <label className="flex items-start gap-3 cursor-pointer text-left">
                        <input
                            type="checkbox"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                            className="mt-1"
                        />
                        <div className="text-left">
                            <div className="font-medium text-left">Show my profile on the public website</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                Uncheck to hide your profile from public pages (still visible to admins)
                            </div>
                        </div>
                    </label>

                    {/* Only show email/mobile options if profile is public */}
                    {formData.isPublic && (
                        <>
                            <label className="flex items-start gap-3 cursor-pointer text-left">
                                <input
                                    type="checkbox"
                                    checked={formData.canShowEmail}
                                    onChange={(e) => setFormData({ ...formData, canShowEmail: e.target.checked })}
                                    className="mt-1"
                                />
                                <div className="text-left">
                                    <div className="font-medium text-left">Show my email address publicly</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                        Allow visitors to see your email address
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer text-left">
                                <input
                                    type="checkbox"
                                    checked={formData.canShowMobileNumber}
                                    onChange={(e) => setFormData({ ...formData, canShowMobileNumber: e.target.checked })}
                                    className="mt-1"
                                />
                                <div className="text-left">
                                    <div className="font-medium text-left">Show my mobile number publicly</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                        Allow visitors to see your phone number
                                    </div>
                                </div>
                            </label>
                        </>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 transition-colors"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                {message && (
                    <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-700 text-left">
                        {message}
                    </div>
                )}
            </form>
        </div>
    )
}
