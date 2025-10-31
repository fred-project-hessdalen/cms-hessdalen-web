"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"

type ProfileData = {
    name: string
    email: string
    summary?: string
    mobileNumber?: string
    isPublic: boolean
    isActive: boolean
    canShowEmail: boolean
    canShowMobileNumber: boolean
    location?: {
        lat?: number
        lng?: number
    }
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
        isActive: person.isActive ?? true,
        canShowEmail: person.canShowEmail ?? false,
        canShowMobileNumber: person.canShowMobileNumber ?? false,
        locationLat: person.location?.lat?.toString() || "",
        locationLng: person.location?.lng?.toString() || "",
    })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        try {
            // Use different API endpoint for member vs token-based editing
            const apiUrl = token === "member"
                ? "/api/member/profile"
                : `/api/profile/${token}`

            // Prepare data with location object
            const updateData = {
                summary: formData.summary,
                mobileNumber: formData.mobileNumber,
                isPublic: formData.isPublic,
                isActive: formData.isActive,
                canShowEmail: formData.canShowEmail,
                canShowMobileNumber: formData.canShowMobileNumber,
                location: {
                    lat: formData.locationLat ? parseFloat(formData.locationLat) : undefined,
                    lng: formData.locationLng ? parseFloat(formData.locationLng) : undefined,
                }
            }

            const response = await fetch(apiUrl, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            })

            if (response.ok) {
                setMessage("✅ Profile updated successfully! Note: Changes may take a few minutes to appear due to caching.")
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

                {/* Location */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg text-left">Location (for map display)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="locationLat" className="block text-sm font-medium mb-2 text-left">
                                Latitude
                            </label>
                            <input
                                id="locationLat"
                                type="number"
                                step="any"
                                value={formData.locationLat}
                                onChange={(e) => setFormData({ ...formData, locationLat: e.target.value })}
                                placeholder="62.7945"
                                min="-90"
                                max="90"
                                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-left"
                                suppressHydrationWarning
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
                                Range: -90 to 90
                            </p>
                        </div>
                        <div>
                            <label htmlFor="locationLng" className="block text-sm font-medium mb-2 text-left">
                                Longitude
                            </label>
                            <input
                                id="locationLng"
                                type="number"
                                step="any"
                                value={formData.locationLng}
                                onChange={(e) => setFormData({ ...formData, locationLng: e.target.value })}
                                placeholder="11.1850"
                                min="-180"
                                max="180"
                                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-left"
                                suppressHydrationWarning
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
                                Range: -180 to 180
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                        Set your geographic coordinates for the map (center of your town, region or country - not your house!). <br />
                        <b>Go to google maps to find the coordinates.</b>  Right-click on the map to get the Long, Lat.<br />
                        Leave empty if you don&apos;t want to be shown on maps.
                    </p>
                </div>

                {/* Privacy Checkboxes */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg text-left">Privacy Settings</h3>

                    <label className="flex items-start gap-3 cursor-pointer text-left">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="mt-1"
                        />
                        <div className="text-left">
                            <div className="font-medium text-left">Active member</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                Uncheck to <b><u>completely</u></b> hide your profile from the website <br />(not visible to members or on public pages)
                            </div>
                        </div>
                    </label>

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
                                Uncheck to hide your profile from public pages <br />(still visible to other members when they are logged in)
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
                                        Allow visitors to see your email address. <br />Note: Your email is always visible to logged-in members.
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
                                        Allow visitors to see your phone number. <br />Note: Your mobile number is NOT visible to logged-in members unless it is explicitly allowed in your profile settings.
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
