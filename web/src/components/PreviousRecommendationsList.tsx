"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Recommendation {
    _id: string
    title: string
    link?: string
    expiresAt?: string
    _createdAt: string
}

interface PreviousRecommendationsListProps {
    recommendations: Recommendation[]
}

export function PreviousRecommendationsList({ recommendations }: PreviousRecommendationsListProps) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (recommendationId: string) => {
        if (!confirm("Are you sure you want to delete this recommendation?")) {
            return
        }

        setDeletingId(recommendationId)

        try {
            const response = await fetch("/api/recommendations/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ recommendationId }),
            })

            if (!response.ok) {
                throw new Error("Failed to delete recommendation")
            }

            // Refresh the page to show updated list
            router.refresh()
        } catch (error) {
            alert("Failed to delete recommendation. Please try again.")
            setDeletingId(null)
        }
    }

    if (!recommendations || recommendations.length === 0) {
        return null
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Your Previous Recommendations
            </h2>
            <div className="space-y-4">
                {recommendations.map((rec) => {
                    const isExpired = rec.expiresAt && new Date(rec.expiresAt) < new Date()
                    const isExternalLink = rec.link?.includes("://")
                    const isDeleting = deletingId === rec._id

                    return (
                        <div
                            key={rec._id}
                            className={`border rounded-lg p-4 ${
                                isExpired
                                    ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                                    : "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {rec.link ? (
                                            isExternalLink ? (
                                                <a
                                                    href={rec.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                                                >
                                                    <span>{rec.title}</span>
                                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <Link
                                                    href={rec.link}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    {rec.title}
                                                </Link>
                                            )
                                        ) : (
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {rec.title}
                                            </span>
                                        )}
                                        {isExpired && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                                Expired
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {rec.expiresAt ? (
                                            <>
                                                {isExpired ? "Expired" : "Expires"}:{" "}
                                                {new Date(rec.expiresAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </>
                                        ) : (
                                            "No expiration"
                                        )}
                                    </div>
                                    {rec.link && (
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                                            {rec.link}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(rec._id)}
                                    disabled={isDeleting}
                                    className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete recommendation"
                                >
                                    {isDeleting ? (
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
