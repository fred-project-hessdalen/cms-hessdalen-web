import React from "react";

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
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
                <span>
                    &copy; {new Date().getFullYear()} {footer?.copyright || "Hessdalen"}.
                </span>
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
                <div className="flex flex-col items-center justify-center text-center">
                    {footer?.footerNote && (
                        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                            {footer.footerNote}
                        </div>
                    )}
                </div>
                <span>
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
