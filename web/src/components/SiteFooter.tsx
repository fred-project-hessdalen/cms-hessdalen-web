import React from "react";

export default function SiteFooter() {
    return (
        <footer className="w-full bg-gray-100 dark:bg-gray-900 py-6 mt-0 text-center text-sm text-gray-600 dark:text-gray-300">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
                <span>
                    &copy; {new Date().getFullYear()} Hessdalen. All rights reserved.
                </span>
                <a href="#top" className="underline hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1" aria-label="Back to top">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.707 7.707a1 1 0 0 1-1.414 0L10 2.414V15a1 1 0 1 1-2 0V2.414L3.293 7.707a1 1 0 0 1-1.414-1.414l7-7a1 1 0 0 1 1.414 0l7 7a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
                    </svg>
                </a>
                <span>
                    Contact: <a href="mailto:admin@hessdalen.com" className="underline">admin@hessdalen.com</a> | <a href="tel:+4794086203" className="underline">+47 94 08 62 03</a>
                </span>
            </div>
        </footer>
    );
}
