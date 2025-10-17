"use client";
import { useState } from "react";

export default function StatusPage() {
    const [status, setStatus] = useState<string>("");

    async function handleInvalidate(e: React.FormEvent) {
        e.preventDefault();
        setStatus("Invalidating...");
        const res = await fetch("/api/invalidate-cache", { method: "POST" });
        if (res.ok) {
            setStatus("Cache invalidated!");
        } else {
            setStatus("Failed to invalidate cache.");
        }
    }

    return (
        <div className="max-w-xl mx-auto py-16 px-4">
            <h1 className="text-2xl font-bold mb-4">Status & Cache Control</h1>
            <form onSubmit={handleInvalidate}>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Invalidate Cache
                </button>
            </form>
            {status && <p className="mt-4 text-green-600 text-sm">{status}</p>}
            <p className="mt-4 text-gray-600 text-sm">
                Click the button to invalidate the cache.<br />
                This will force the next navigation fetch to get fresh data from Sanity.
            </p>
        </div>
    );
}