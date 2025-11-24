"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const ACCESS_KEY_STORAGE_KEY = "hessdalen_access_key";

export function AccessKeyHandler() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const keyParam = searchParams.get("key");

        if (keyParam) {
            // Store the new key in localStorage
            localStorage.setItem(ACCESS_KEY_STORAGE_KEY, keyParam);
        } else {
            // Check if we have a stored key
            const storedKey = localStorage.getItem(ACCESS_KEY_STORAGE_KEY);

            if (storedKey) {
                // Navigate to the same page with the key parameter
                const url = new URL(window.location.href);
                url.searchParams.set("key", storedKey);
                router.replace(url.pathname + url.search);
            }
        }
    }, [searchParams, pathname, router]);

    return null;
}

// Helper function to clear the stored key (can be used for logout/clearing)
export function clearStoredAccessKey() {
    if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_KEY_STORAGE_KEY);
    }
}

// Helper function to get the stored key
export function getStoredAccessKey(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem(ACCESS_KEY_STORAGE_KEY);
    }
    return null;
}
