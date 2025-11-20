"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type ProfileData = {
    name: string
    displayName: string
    email: string
    summary?: string
    mobileNumber?: string
    website?: string
    isPublic: boolean
    isActive: boolean
    canShowEmail: boolean
    canShowMobileNumber: boolean
    location?: {
        lat?: number
        lng?: number
    }
    image?: {
        asset?: {
            _ref?: string
            url?: string
        }
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
        website: person.website || "",
        isPublic: person.isPublic ?? true,
        isActive: person.isActive ?? true,
        canShowEmail: person.canShowEmail ?? false,
        canShowMobileNumber: person.canShowMobileNumber ?? false,
        locationLat: person.location?.lat?.toString() || "",
        locationLng: person.location?.lng?.toString() || "",
    })

    const [uploadingImage, setUploadingImage] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(
        person.image?.asset?.url || null
    )

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
                website: formData.website,
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage("❌ Please upload an image file")
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setMessage("❌ Image must be smaller than 2MB")
            return
        }

        // Check if image is square
        const img = document.createElement('img')
        const objectUrl = URL.createObjectURL(file)

        img.onload = async () => {
            URL.revokeObjectURL(objectUrl) // Clean up

            if (img.width !== img.height) {
                setMessage(`❌ Profile picture must be square. Your image is ${img.width}x${img.height}`)
                return
            }

            // Image is valid, proceed with upload
            setUploadingImage(true)
            setMessage("")

            try {
                const formData = new FormData()
                formData.append('image', file)

                // Use different API endpoint for member vs token-based editing
                const apiUrl = token === "member"
                    ? "/api/member/profile/image"
                    : `/api/profile/${token}/image`

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData,
                })

                if (response.ok) {
                    const data = await response.json()
                    setImagePreview(data.imageUrl)
                    setMessage("✅ Image uploaded successfully!")
                    router.refresh()
                } else {
                    const error = await response.json()
                    setMessage(`❌ Error uploading image: ${error.error}`)
                }
            } catch {
                setMessage("❌ Failed to upload image")
            } finally {
                setUploadingImage(false)
            }
        }

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            setMessage("❌ Failed to load image")
        }

        img.src = objectUrl
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-left" suppressHydrationWarning>
            <h2 className="text-2xl font-bold mb-0 text-left">{person.name}
            </h2>
            <table>
                <tr>
                    <td>Display name:</td>
                    <td>&nbsp;{person.displayName}</td>
                </tr>
                <tr>
                    <td>E-mail:</td>
                    <td>&nbsp;{person.email}</td>
                </tr>

            </table>

            {message && (
                <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-700 text-left">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>

                {/* Profile Image */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-lg text-left">Profile Image</h3>
                    <div className="flex items-start gap-6">
                        {/* Image Preview */}
                        <div className="flex-shrink-0">
                            {imagePreview ? (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600">
                                    <Image
                                        src={imagePreview}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                                    <span className="text-4xl font-semibold text-gray-400 dark:text-gray-500">
                                        {person.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex-1">
                            <label className="block">
                                <span className="sr-only">Choose profile photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        dark:file:bg-blue-900 dark:file:text-blue-300
                                        dark:hover:file:bg-blue-800
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {uploadingImage ? "Uploading..." : "Profile picture must be square. JPG, PNG or GIF. Max 2MB."}
                            </p>
                        </div>
                    </div>
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
                            <div className="font-medium text-left">Visible to other members</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                Uncheck to <b><u>completely</u></b> hide your profile from everyone — both members and the public.<br />
                                When hidden, you will not appear in any lists or searches.<br />
                                <span className="text-red-600 dark:text-red-400 font-semibold">
                                    If unchecked, you can <b>not</b> login and you can not see other memebers or read the forum. <br />
                                    You can only access your profile via the special link sent by an administrator.
                                </span>
                            </div>
                        </div>
                    </label>

                    {/* Only show public visibility option if profile is active */}
                    {formData.isActive && (
                        <label className="flex items-start gap-3 cursor-pointer text-left">
                            <input
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                className="mt-1"
                            />
                            <div className="text-left">
                                <div className="font-medium text-left">Visible to the public</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                    Uncheck to hide your profile from public pages <br />
                                    Your profile will still be visible to logged-in members.
                                </div>
                            </div>
                        </label>
                    )}

                    {/* Only show email/mobile options if profile is public */}
                    {formData.isActive && formData.isPublic && (
                        <>
                            <label className="flex items-start gap-3 cursor-pointer text-left">
                                <input
                                    type="checkbox"
                                    checked={formData.canShowEmail}
                                    onChange={(e) => setFormData({ ...formData, canShowEmail: e.target.checked })}
                                    className="mt-1"
                                />
                                <div className="text-left">
                                    <div className="font-medium text-left">Show my email address publicly ({person.email})</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                        Allow visitors to see your email address. <br />Your email is always visible to logged-in members.
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
                                    <div className="font-medium text-left">Show my mobile number to members and visitors</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 text-left">
                                        If you uncheck this, only administrators can see your number.<br />
                                        It won’t appear to members or on the public website.
                                    </div>
                                </div>
                            </label>

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

                            {/* Website */}
                            <div>
                                <label htmlFor="website" className="block text-sm font-medium mb-2 text-left">
                                    Website
                                </label>
                                <input
                                    id="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://example.com"
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


            </form>
        </div>
    )
}
