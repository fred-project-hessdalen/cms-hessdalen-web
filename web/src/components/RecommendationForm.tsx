"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface RecommendationFormProps {
    personId: string
    personName: string
}

export function RecommendationForm({ personId, personName }: RecommendationFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Calculate end of next month as default expiry
    const getEndOfNextMonth = () => {
        const now = new Date()
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59)
        return nextMonth.toISOString().slice(0, 16)
    }

    const [formData, setFormData] = useState({
        title: "",
        link: "",
        expiresAt: getEndOfNextMonth(),
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        // Validate link format (allow relative URLs starting with / or full URLs)
        const link = formData.link.trim()
        if (!link.startsWith('/') && !link.startsWith('http://') && !link.startsWith('https://')) {
            setError('Link must start with /, http://, or https://')
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch("/api/recommendations/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    personId,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to create recommendation")
            }

            // Success - redirect to dashboard
            router.push("/member/dashboard?recommendation=created")
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Person Name (read-only) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recommended by
                </label>
                <input
                    type="text"
                    value={personName}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                />
            </div>

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Great article about Hessdalen lights"
                />
            </div>

            {/* Link */}
            <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="link"
                    required
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/article or /page"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter a full URL (http:// or https://) or a relative path starting with /
                </p>
            </div>

            {/* Expires At */}
            <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expires At <span className="text-red-500">*</span>
                </label>
                <input
                    type="datetime-local"
                    id="expiresAt"
                    required
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    When should this recommendation stop showing?
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Creating..." : "Create Recommendation"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/member/dashboard")}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
