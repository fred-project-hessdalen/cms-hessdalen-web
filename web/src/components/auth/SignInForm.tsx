"use client"

import { useState, FormEvent, useEffect } from "react"
import { signIn } from "next-auth/react"

const LAST_EMAIL_KEY = "lastSignInEmail"

export function SignInForm() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    // Load last used email from localStorage on mount
    useEffect(() => {
        const lastEmail = localStorage.getItem(LAST_EMAIL_KEY)
        if (lastEmail) {
            setEmail(lastEmail)
        }
    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const result = await signIn("email", {
                email,
                redirect: false,
                callbackUrl: "/member/dashboard",
            })

            if (result?.error) {
                setError("Failed to send sign-in link. Please try again.")
            } else {
                // Save email to localStorage for future use
                localStorage.setItem(LAST_EMAIL_KEY, email)
                setSuccess(true)
            }
        } catch {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <div className="mb-4">
                    <svg
                        className="w-16 h-16 mx-auto text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Check your email
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    A sign-in link has been sent to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    If you are registered as a member, you should receive an email within a few minutes.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                    Don&apos;t see it? Check your spam folder or contact an administrator if you believe you should have access.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        placeholder="you@example.com"
                        disabled={loading}
                        suppressHydrationWarning
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? "Sending..." : "Send magic link"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    No password required. <br />We&apos;ll send you a secure link to sign in.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Only registered members will receive magic links.
                </p>
            </div>
        </div>
    )
}
