import React from "react";
import ThemeToggle from "./ThemeToggle";

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
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-evenly gap-4 px-4">
                {/* Copyright */}
                <span className="order-2 md:order-1">
                    &copy; {new Date().getFullYear()} {footer?.copyright || "Hessdalen"}.
                </span>

                {/* Back to Top Button */}
                <a
                    href="#top"
                    aria-label="Back to top"
                    className="order-1 md:order-2 inline-flex items-center gap-2 px-4 py-2 border border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.707 7.707a1 1 0 0 1-1.414 0L10 2.414V15a1 1 0 1 1-2 0V2.414L3.293 7.707a1 1 0 0 1-1.414-1.414l7-7a1 1 0 0 1 1.414 0l7 7a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Back to top</span>
                </a>

                {/* Theme Toggle */}
                <div className="order-3 md:order-3">
                    <ThemeToggle />
                </div>

                {/* Footer Note */}
                {footer?.footerNote && (
                    <div className="order-4 md:order-4 w-full md:w-auto text-xs text-gray-500 dark:text-gray-400 text-center">
                        {footer.footerNote}
                    </div>
                )}

                {/* Contact */}
                <span className="order-5 md:order-5">
                    Contact:
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
