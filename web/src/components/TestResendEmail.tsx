"use client"

import { useEffect, useState } from "react"

export function TestResendEmail() {
    const [sending, setSending] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        if (cooldown === 0) return
        const timeout = window.setTimeout(() => setCooldown(seconds => seconds - 1), 1000)
        return () => window.clearTimeout(timeout)
    }, [cooldown])

    async function sendTestEmail() {
        setSending(true)
        setMessage("")
        setError("")

        try {
            const response = await fetch("/api/test-resend", { method: "POST" })
            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Unable to send the test email.")
            }

            setMessage("Test email accepted by Resend. Check your inbox and spam folder.")
            setCooldown(60)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to send the test email.")
        } finally {
            setSending(false)
        }
    }

    return (
        <section className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Email diagnostics
            </h2>
            <button
                type="button"
                onClick={sendTestEmail}
                disabled={sending || cooldown > 0}
                aria-busy={sending}
                className="min-h-11 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-60"
            >
                {sending ? "Sending..." : cooldown > 0 ? `Send again in ${cooldown}s` : "Send test email"}
            </button>
            <div aria-live="polite" aria-atomic="true" className="mt-3 text-sm">
                {message && <p className="text-green-700 dark:text-green-400">{message}</p>}
                {error && <p className="text-red-700 dark:text-red-400">{error}</p>}
            </div>
        </section>
    )
}