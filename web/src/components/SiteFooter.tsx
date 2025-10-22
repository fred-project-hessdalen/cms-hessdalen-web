import React from "react";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";

interface FooterProps {
    copyright?: string;
    footerNote?: string;
}

interface ContactProps {
    email?: string;
    phone?: string;
}

interface SiteFooterProps {
    contact?: ContactProps;
    footer?: FooterProps;
}

export default function SiteFooter({ contact, footer }: SiteFooterProps) {
    return (
        <footer className="w-full bg-gray-200 dark:bg-gray-800 py-4 mt-0 text-center text-sm text-gray-600 dark:text-gray-300">
            {/* Footer Note */}
            {footer?.footerNote && (
                <div className="mb-4 w-full md:w-auto text-lg text-gray-500 dark:text-gray-400 text-center">
                    {footer.footerNote}
                </div>
            )}

            <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 px-4 items-center">
                {/* Copyright */}
                <span className="order-2 md:order-1 text-center">
                    &copy; {new Date().getFullYear()} {footer?.copyright || "Hessdalen"}.
                </span>

                {/* Back to Top Button */}
                <div className="order-1 md:order-2 flex justify-center">
                    <a
                        href="#top"
                        aria-label="Back to top"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M16.707 7.707a1 1 0 0 1-1.414 0L10 2.414V15a1 1 0 1 1-2 0V2.414L3.293 7.707a1 1 0 0 1-1.414-1.414l7-7a1 1 0 0 1 1.414 0l7 7a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Back to top</span>
                    </a>
                </div>

                {/* Theme Toggle */}
                <div className="order-3 md:order-3 flex justify-center">
                    <ThemeToggle />
                </div>

                {/* To people page */}
                <div className="order-4 md:order-4 flex justify-center">
                    <Link
                        href="/people"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="hidden sm:inline">Members</span>
                    </Link>
                </div>

                {/* Contact */}
                <span className="order-5 md:order-5 text-center">
                    {contact?.email && (
                        <>
                            {" "}
                            <a href={`mailto:${contact.email}`} className="underline">{contact.email}</a>
                        </>
                    )}
                    {contact?.phone && (
                        <>
                            {contact?.email ? " | " : " "}
                            <a href={`tel:${contact.phone}`} className="underline">{contact.phone}</a>
                        </>
                    )}
                </span>
            </div>
        </footer>
    );
}
